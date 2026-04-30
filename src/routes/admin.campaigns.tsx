import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/campaigns")({
  component: AdminCampaigns,
});

const empty = {
  brand_name: "", title: "", brief: "", tagline: "", platform: "both",
  cpv_paise: 50, slots_total: 10, target_niches: "", deliverables: "",
  cover_image_url: "", brand_logo_url: "", deadline: "",
};

function AdminCampaigns() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.brand_name || !editing.title || !editing.brief) return toast.error("Fill brand, title & brief");
    const payload = {
      brand_name: editing.brand_name, title: editing.title, brief: editing.brief, tagline: editing.tagline || null,
      platform: editing.platform, cpv_paise: parseInt(editing.cpv_paise) || 50, slots_total: parseInt(editing.slots_total) || 10,
      target_niches: typeof editing.target_niches === "string" ? editing.target_niches.split(",").map((s: string) => s.trim()).filter(Boolean) : editing.target_niches,
      deliverables: typeof editing.deliverables === "string" ? editing.deliverables.split(",").map((s: string) => s.trim()).filter(Boolean) : editing.deliverables,
      cover_image_url: editing.cover_image_url || null, brand_logo_url: editing.brand_logo_url || null,
      deadline: editing.deadline || null,
    };
    if (editing.id) {
      const { error } = await supabase.from("campaigns").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("campaigns").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black">Campaigns</h2>
        <button onClick={() => setEditing({ ...empty })} className="grad-coin px-3 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-1"><Plus className="h-4 w-4" />New</button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map(c => (
          <li key={c.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.brand_name} · {c.platform} · ₹{(c.cpv_paise/100).toFixed(2)} CPV · {c.slots_filled}/{c.slots_total}</div>
            </div>
            <button onClick={() => setEditing({ ...c, target_niches: c.target_niches?.join(", "), deliverables: c.deliverables?.join(", "), deadline: c.deadline?.slice(0,10) ?? "" })} className="text-muted-foreground"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-end sm:place-items-center" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-lg glass-card rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-auto">
            <h3 className="font-black text-lg">{editing.id ? "Edit" : "New"} campaign</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <input className={cls} placeholder="Brand name" value={editing.brand_name} onChange={e => setEditing({ ...editing, brand_name: e.target.value })} />
              <input className={cls} placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              <input className={cls + " col-span-2"} placeholder="Tagline" value={editing.tagline ?? ""} onChange={e => setEditing({ ...editing, tagline: e.target.value })} />
              <textarea className={cls + " col-span-2 min-h-[100px]"} placeholder="Brief" value={editing.brief} onChange={e => setEditing({ ...editing, brief: e.target.value })} />
              <select className={cls} value={editing.platform} onChange={e => setEditing({ ...editing, platform: e.target.value })}>
                <option value="both">both</option><option value="instagram">instagram</option><option value="youtube">youtube</option>
              </select>
              <input className={cls} placeholder="CPV paise" type="number" value={editing.cpv_paise} onChange={e => setEditing({ ...editing, cpv_paise: e.target.value })} />
              <input className={cls} placeholder="Slots total" type="number" value={editing.slots_total} onChange={e => setEditing({ ...editing, slots_total: e.target.value })} />
              <input className={cls} type="date" value={editing.deadline ?? ""} onChange={e => setEditing({ ...editing, deadline: e.target.value })} />
              <input className={cls + " col-span-2"} placeholder="Niches (comma sep)" value={editing.target_niches} onChange={e => setEditing({ ...editing, target_niches: e.target.value })} />
              <input className={cls + " col-span-2"} placeholder="Deliverables (comma sep)" value={editing.deliverables} onChange={e => setEditing({ ...editing, deliverables: e.target.value })} />
              <input className={cls + " col-span-2"} placeholder="Cover image URL" value={editing.cover_image_url ?? ""} onChange={e => setEditing({ ...editing, cover_image_url: e.target.value })} />
              <input className={cls + " col-span-2"} placeholder="Brand logo URL" value={editing.brand_logo_url ?? ""} onChange={e => setEditing({ ...editing, brand_logo_url: e.target.value })} />
            </div>
            <button onClick={save} className="mt-4 w-full grad-coin py-3 rounded-2xl font-bold ring-coin">Save</button>
            <button onClick={() => setEditing(null)} className="mt-2 w-full text-sm text-muted-foreground py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
const cls = "bg-input/60 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";