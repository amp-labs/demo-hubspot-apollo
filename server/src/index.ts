import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with the database
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());

// Apollo API configuration
const APOLLO_AMP_PROXY_API_URL = "https://proxy.withampersand.com/v1/contacts/search";
const AMP_API_KEY = process.env.AMP_API_KEY;

interface Contact {
  name: string;
  email?: string;
  // Add other fields as necessary
}

interface WebhookPayload {
  contacts: Contact[];
  action: string;
  groupName: string;
  groupRef: string;
  installationId: string;
  objectName: string;
  projectId: string;
  provider: string;
  result: any;
}

interface ContactStored {
  id: string;
  email: string;
}

app.post("/webhook", async (req: Request, res: Response) => {
  const payload: WebhookPayload = req.body;
  console.log("Webhook payload:", payload);
  if (!payload || !payload.result) {
    return res.status(400).send("Invalid payload");
  }

  const contactsToSave: ContactStored[] = [];
  payload?.result?.forEach((resultItem: any) => {
    console.log("Result Item:", resultItem);
    // console.log("Raw Properties:", resultItem?.raw?.properties);
    contactsToSave.push({
      id: resultItem?.raw?.id,
      email: resultItem?.fields.email,
    });
  });

  console.log("Storing contacts in Supabase:", contactsToSave);
  // Store the contacts in Supabase for later processing
  const { error } = await supabase
    .from("contacts")
    .upsert(contactsToSave)
    .select();

  if (error) {
    console.error("Error storing contacts:", error);
    return res.status(500).send("Internal Server Error");
  }
  res.status(200).send("Synced contacts successfully");
});

const processContacts = async () => {
  const storedContacts: any = await supabase.from("contacts").select();

  console.log("storedContacts:", storedContacts);
  const repliedContacts: Contact[] = [];

  for (const contact of [storedContacts.data[0]]) { // FIXME: Update this when proxy response is correct. 
    const response = await axios.post(
      APOLLO_AMP_PROXY_API_URL,
      {
        q_keywords: contact.email,
        contact_stage_ids: ["6508dea16d3b6400a3ed7034"], // TODO: Get this dynamically from Apollo API.
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${AMP_API_KEY}`,
          "x-amp-proxy-version": 1,
          "x-amp-project-id": `${process.env.AMP_PROJECT_ID}`,
          "x-amp-installation-id": `${process.env.AMP_INSTALLATION_ID}`,
        },
      }
    );

    console.log("Apollo Response:", response.data);

    const contactsInApollo = response.data.contacts;

    // Check if the contact is in the "Replied" stage
    if (contactsInApollo && contactsInApollo.length > 0) {
      repliedContacts.push(...contactsInApollo);
    }
  }

  console.log("Replied Contacts:", repliedContacts);
  // TODO: Add a way to update these contact's `amp_has_replied` field in HubSpot
};

// Process the contacts stored in Supabase coming from HubSpot.
app.get("/process", async (req: Request, res: Response) => {
  try {
    await processContacts(); // TODO: Maybe run this as a cron job.
    res.status(200).send("Processed contacts successfully");
  } catch (error) {
    console.error("Error processing contacts:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
