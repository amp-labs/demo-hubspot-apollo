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
const AMP_PROXY_BASE_URL = "https://proxy.withampersand.com";
const AMP_API_KEY = process.env.AMP_API_KEY;

interface Contact {
  id: string;
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

interface ApolloContactStage {
  id: string;
  team_id: string;
  display_name: string;
  name: string;
  display_order: number;
}

app.post("/webhook", async (req: Request, res: Response) => {
  const payload: WebhookPayload = req.body;
  if (!payload || !payload.result) {
    return res.status(400).send("Invalid payload");
  }

  const contactsToSave: ContactStored[] = [];
  payload?.result?.forEach((resultItem: any) => {
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
  // Get "Replied" contact stage ID from Apollo
  const res = await axios.get(AMP_PROXY_BASE_URL + "/v1/contact_stages", {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${AMP_API_KEY}`,
      "x-amp-proxy-version": 1,
      "x-amp-project-id": `${process.env.AMP_PROJECT_ID}`,
      "x-amp-installation-id": `${process.env.AMP_APOLLO_INSTALLATION_ID}`,
    },
  });

  const contactStages: ApolloContactStage[] = res.data.contact_stages;
  const repliedStage = contactStages.find(
    (stage: ApolloContactStage) => stage.name === "Replied"
  );

  const response = await axios.post(
    AMP_PROXY_BASE_URL + "/v1/contacts/search",
    {
      contact_stage_ids: [repliedStage?.id],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${AMP_API_KEY}`,
        "x-amp-proxy-version": 1,
        "x-amp-project-id": `${process.env.AMP_PROJECT_ID}`,
        "x-amp-installation-id": `${process.env.AMP_APOLLO_INSTALLATION_ID}`,
      },
    }
  );

  const repliedContacts = response.data.contacts;

  const commonContacts: Contact[] = storedContacts?.data?.filter(
    (storedContact: { email: any }) =>
      repliedContacts.some(
        (repliedContact: { email: any }) =>
          storedContact.email === repliedContact.email
      )
  );

  console.log("Replied Contacts in HubSpot:", commonContacts);

  // Add a way to update these contact's `amp_apollo_has_replied_email` field in HubSpot
  const batchUpdateHubSpot = await axios.post(
    AMP_PROXY_BASE_URL + "/crm/v3/objects/contacts/batch/update",
    {
      inputs: commonContacts.map((contact) => ({
        id: contact.id,
        properties: {
          amp_apollo_has_replied_email: "true",
        },
      })),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${AMP_API_KEY}`,
        "x-amp-proxy-version": 1,
        "x-amp-project-id": `${process.env.AMP_PROJECT_ID}`,
        "x-amp-installation-id": `${process.env.AMP_HUBSPOT_INSTALLATION_ID}`,
      },
    }
  );

  console.log("Batch Update HubSpot Response:", batchUpdateHubSpot.data?.status);
};

// Process the contacts stored in Supabase coming from HubSpot.
app.get("/process", async (req: Request, res: Response) => {
  try {
    await processContacts();
    res.status(200).send("Processed contacts successfully");
  } catch (error) {
    console.error("Error processing contacts:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
