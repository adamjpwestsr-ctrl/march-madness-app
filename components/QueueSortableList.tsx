"use client";

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
  arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function QueueSortableList({
  queue,
  players,
  updateRank,
}: {
  queue: { player_id: number }[];
  players: any[];
  updateRank: (playerId: number, newRank: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((q) => q.player_id === active.id);
    const newIndex = queue.findIndex((q) => q.player_id === over.id);

    const newQueue = arrayMove(queue, oldIndex, newIndex);

    // Update ranks in Supabase
    newQueue.forEach((item, idx) => {
      updateRank(item.player_id, idx + 1);
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={queue.map((q) => q.player_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {queue.map((q) => {
            const player = players.find((p) => p.id === q.player_id);
            return (
              <SortableItem key={q.player_id} id={q.player_id}>
                <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                  <div>
                    <div className="text-white font-semibold">
                      {player?.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {player?.team} • {player?.position}
                    </div>
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
