// Public site configuration. The Supabase publishable key is safe to expose:
// row-level security only allows anonymous SELECT of approved rows and INSERT.
export const CONFIG = Object.freeze({
  supabaseUrl: "https://idgwbzckafwblfuaztcb.supabase.co",
  supabaseKey: "sb_publishable_J-f2p8YKmzAUISVUhpW3UA_Zhz1RsaQ",
  table: "yizkor_names",
  yearLabel: 'תשפ"ז',
  communityName: 'בית כנסת בית הרמב"ם - מודיעין',
  rabbiName: "הרב חייא בן חמו",
  whatsappPhone: "972508858932",
  bitPhone: "050-8858932",
  payboxUrl: "https://payboxapp.page.link/ncu2aRodKL8mu6L89",
  kaparotMinimumIls: 26,
  baseListPath: "data/names.json",
  maxSubmitsPerMinute: 5,
});
