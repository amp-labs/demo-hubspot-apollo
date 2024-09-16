import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());

// Apollo API configuration
const APOLLO_AMP_PROXY_API_URL = 'https://proxy.withampersand.com/v1/contacts/search';
const AMP_API_KEY =  process.env.AMP_API_KEY; 

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


app.post('/webhook', async (req: Request, res: Response) => {
  const payload: WebhookPayload = req.body;
  payload?.result?.forEach((resultItem: any) => {
      console.log("Raw Properties:", resultItem?.raw?.properties);
  });
  // TODO: ensure the correct payload structure is being sent from the client
  if (!payload || !payload.contacts) {
    return res.status(400).send('Invalid payload');
  }

  try {
    const repliedContacts: Contact[] = [];

    for (const contact of payload.contacts) {
      const response = await axios.post(
        APOLLO_AMP_PROXY_API_URL,
        {
          api_key: AMP_API_KEY, // TODO: Ensure correct heads for Ampersand are set here. 
          q: contact.email,
          contact_stage: 'Replied'
        }
      );

      const contactsInApollo = response.data.contacts;

      // Check if the contact is in the "Replied" stage
      if (contactsInApollo && contactsInApollo.length > 0) {
        repliedContacts.push(...contactsInApollo);
      }
    }

    console.log('Replied Contacts:', repliedContacts);
    // TODO: Add a way to update these contact's apollo_contact_stage field in HubSpot

    res.status(200).send('Processed contacts successfully');
  } catch (error) {
    console.error('Error processing contacts:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
