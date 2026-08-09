"use client";

export default function SocialFeed({ posts }: { posts: any[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-slate-900 border border-slate-700 p-4 rounded-xl"
        >
          <p className="text-slate-300 text-sm mb-2">
            {post.users?.username || post.users?.email}
            {" • "}
            <span className="text-emerald-400">{post.sport_tag}</span>
          </p>

          <p className="text-white">{post.content}</p>

          <p className="text-slate-500 text-xs mt-2">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
