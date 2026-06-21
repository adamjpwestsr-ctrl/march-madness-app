"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const uuid = () => crypto.randomUUID();

interface DerbyEvent {
  id: number;
  event_year: number;
}

interface DerbyPlayer {
  id: number;
  event_id: number;
  player_name: string;
  team_name: string;
  hr_count: number;
  image_url: string;
  order_index: number;
}

export default function AdminDerbyPlayers() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<DerbyPlayer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Load event + players
  useEffect(() => {
    const load = async () => {
      const { data: eventData } = await supabase
        .from("mlb_derby_events")
        .select("id, event_year")
        .order("event_year", { ascending: false })
        .limit(1)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }

      setEvent(eventData);

      const { data: playersData } = await supabase
        .from("mlb_derby_players")
        .select("*")
        .eq("event_id", eventData.id)
        .order("order_index", { ascending: true });

      setPlayers(playersData || []);
      setLoading(false);
    };

    load();
  }, []);

  // Upload image to Supabase Storage
  const uploadImage = async (file: File, year: number) => {
    const ext = file.name.split(".").pop();
    const fileName = `${uuid()}.${ext}`;
    const filePath = `${year}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("mlb-derby")
      .upload(filePath, file);

    if (uploadError) {
      showToast("Image upload failed.");
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("mlb-derby")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  };

  // Add Player
  const handleAddPlayer = async (formData: FormData) => {
    if (!event) return;

    const name = formData.get("player_name") as string;
    const team = formData.get("team_name") as string;
    const hr = Number(formData.get("hr_count"));
    const file = formData.get("image") as File;

    if (!name || !team || !hr || !file) {
      showToast("All fields required.");
      return;
    }

    const imageUrl = await uploadImage(file, event.event_year);
    if (!imageUrl) return;

    const nextOrder = players.length;

    const { data, error } = await supabase
      .from("mlb_derby_players")
      .insert({
        event_id: event.id,
        player_name: name,
        team_name: team,
        hr_count: hr,
        image_url: imageUrl,
        order_index: nextOrder,
      })
      .select("*")
      .single();

    if (error) {
      showToast("Error adding player.");
      return;
    }

    setPlayers([...players, data]);
    setShowAddModal(false);
    showToast("Player added.");
  };

  // Edit Player
  const handleEditPlayer = async (formData: FormData) => {
    if (!editPlayer || !event) return;

    const name = formData.get("player_name") as string;
    const team = formData.get("team_name") as string;
    const hr = Number(formData.get("hr_count"));
    const file = formData.get("image") as File;

    let imageUrl = editPlayer.image_url;

    if (file && file.size > 0) {
      const uploaded = await uploadImage(file, event.event_year);
      if (uploaded) imageUrl = uploaded;
    }

    const { data, error } = await supabase
      .from("mlb_derby_players")
      .update({
        player_name: name,
        team_name: team,
        hr_count: hr,
        image_url: imageUrl,
      })
      .eq("id", editPlayer.id)
      .select("*")
      .single();

    if (error) {
      showToast("Error updating player.");
      return;
    }

    setPlayers(players.map((p) => (p.id === data.id ? data : p)));
    setEditPlayer(null);
    showToast("Player updated.");
  };

  // Delete Player
  const handleDeletePlayer = async (id: number) => {
    const { error } = await supabase
      .from("mlb_derby_players")
      .delete()
      .eq("id", id);

    if (error) {
      showToast("Error deleting player.");
      return;
    }

    const updated = players.filter((p) => p.id !== id);

    // Re-normalize order indexes
    const reordered = updated.map((p, i) => ({ ...p, order_index: i }));

    setPlayers(reordered);

    await supabase.from("mlb_derby_players").upsert(
      reordered.map((p) => ({
        id: p.id,
        order_index: p.order_index,
      }))
    );

    showToast("Player deleted.");
  };

  // Drag-and-drop reorder
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = players.findIndex((p) => p.id === active.id);
    const newIndex = players.findIndex((p) => p.id === over.id);

    const reordered = [...players];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const normalized = reordered.map((p, i) => ({
      ...p,
      order_index: i,
    }));

    setPlayers(normalized);

    await supabase.from("mlb_derby_players").upsert(
      normalized.map((p) => ({
        id: p.id,
        order_index: p.order_index,
      }))
    );

    showToast("Order updated.");
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
        Loading players...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
        No Derby event found. Create an event first.
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
      <h2 className="text-xl font-semibold mb-4">Derby Participants</h2>

      {players.length < 8 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="mb-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-sm font-semibold"
        >
          Add Player
        </button>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <SortablePlayerCard
                key={player.id}
                player={player}
                onEdit={() => setEditPlayer(player)}
                onDelete={() => handleDeletePlayer(player.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAddModal && (
        <PlayerModal
          title="Add Player"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPlayer}
        />
      )}

      {editPlayer && (
        <PlayerModal
          title="Edit Player"
          player={editPlayer}
          onClose={() => setEditPlayer(null)}
          onSubmit={handleEditPlayer}
        />
      )}

      {toast && (
        <div className="mt-4 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   Sortable Player Card Component
--------------------------------*/
function SortablePlayerCard({
  player,
  onEdit,
  onDelete,
}: {
  player: DerbyPlayer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: player.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow hover:border-sky-500 transition"
    >
      <div className="flex justify-between items-center mb-3">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 text-sm"
        >
          ☰
        </span>
      </div>

      <img
        src={player.image_url}
        alt={player.player_name}
        className="w-full h-40 object-cover rounded-md mb-3"
      />

      <div className="text-sm">
        <p className="font-semibold">{player.player_name}</p>
        <p className="text-slate-400">{player.team_name}</p>
        <p className="text-slate-400">{player.hr_count} HRs</p>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded text-xs"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ------------------------------
   Player Modal (Add/Edit)
--------------------------------*/
function PlayerModal({
  title,
  player,
  onClose,
  onSubmit,
}: {
  title: string;
  player?: DerbyPlayer;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md text-white">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <form
          action={(formData) => onSubmit(formData)}
          className="flex flex-col gap-4"
        >
          <input
            name="player_name"
            defaultValue={player?.player_name}
            placeholder="Player Name"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
          />

          <input
            name="team_name"
            defaultValue={player?.team_name}
            placeholder="Team Name"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
          />

          <input
            name="hr_count"
            type="number"
            defaultValue={player?.hr_count}
            placeholder="HR Count"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
          />

          <input
            name="image"
            type="file"
            accept="image/*"
            className="text-sm"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
