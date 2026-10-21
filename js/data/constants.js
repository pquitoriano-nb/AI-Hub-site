// Edit these lists to match your organisation.
export const DEPTS = ["Operations", "Sales", "Marketing", "Customer Support", "Finance", "HR", "Recruitment", "Admin", "IT", "Leadership", "Other"];
export const TYPES = ["New automation", "New AI agent", "Improve something existing", "Training or help", "Not sure yet"];
export const FREQ = ["Daily", "Weekly", "Monthly", "Occasionally"];
export const TOOLS = ["Google Sheets", "Gmail", "Google Drive", "Slack", "CRM", "ClickUp / Asana", "Canva", "Zoom / Meet", "Other"];
export const PRIO = ["Nice to have", "Important", "Urgent"];
export const ISTAT = ["New", "Reviewing", "Building", "Live", "Declined"];
export const ASTAT = ["Live", "Testing", "Building", "Planned", "Paused"];
export const AUTOTOOLS = ["n8n", "Zapier", "Make", "Apps Script", "Power Automate", "Onyx action", "Other"];

// Field definitions for the add/edit sheet of each editable list.
export const SCHEMAS = {
  team: {
    coll: "team", label: "team member",
    fields: [
      { k: "name", l: "Full name", req: true },
      { k: "role", l: "Role", ph: "e.g. AI Automation Specialist" },
      { k: "department", l: "Department", type: "select", opts: DEPTS },
      { k: "focus", l: "Focus areas", ph: "Comma-separated, e.g. Onyx agents, n8n, prompt design" },
      { k: "contact", l: "Contact (email or Slack handle)" },
    ],
  },
  agents: {
    coll: "agents", label: "Onyx agent",
    fields: [
      { k: "name", l: "Agent name", req: true, ph: "e.g. SOP Assistant" },
      { k: "department", l: "Department", type: "select", opts: DEPTS, req: true },
      { k: "description", l: "What it does", type: "textarea" },
      { k: "knowledge", l: "Knowledge sources", ph: "e.g. Google Drive SOP folder, Help Center" },
      { k: "status", l: "Status", type: "select", opts: ASTAT },
      { k: "owner", l: "Owner", ph: "Who maintains it" },
      { k: "link", l: "Link to agent", ph: "https://…" },
    ],
  },
  automations: {
    coll: "automations", label: "automation",
    fields: [
      { k: "name", l: "Automation name", req: true },
      { k: "department", l: "Department", type: "select", opts: DEPTS, req: true },
      { k: "tool", l: "Built with", type: "select", opts: AUTOTOOLS },
      { k: "trigger", l: "Trigger", ph: "e.g. New row in Leads sheet" },
      { k: "description", l: "What it does", type: "textarea" },
      { k: "hoursSaved", l: "Hours saved per week", type: "number" },
      { k: "status", l: "Status", type: "select", opts: ASTAT },
      { k: "owner", l: "Owner" },
    ],
  },
};
