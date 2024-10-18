import { AmpersandProvider, InstallIntegration } from "@amp-labs/react";

function App() {
  const options = {
    projectId: import.meta.env.VITE_AMPERSAND_PROJECT_ID as string, // Your Ampersand project ID.
    apiKey: import.meta.env.VITE_AMPERSAND_API_KEY as string, // Your Ampersand API key.
  };

  const myIntegrationName = "readHubspotContactsWithCustomFields";
  const userId = "demoUserId";
  const userFullName = "Demo User";
  const teamId = "ampersand-hubspot-demo-team-id-3";
  const teamName = "Demo Team Name";

  return (
    <AmpersandProvider options={options}> 
      <div
        style={{
          margin: "15rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <div style={{ display: "flex", marginTop:40 }}>
          <InstallIntegration
            integration={myIntegrationName}
            consumerRef={userId}
            consumerName={userFullName}
            groupRef={teamId}
            groupName={teamName}
            fieldMapping={{
              contacts: [
                {
                  mapToName: 'source',
                  mapToDisplayName: 'Source',
                  prompt: 'Which field do you use to track the source of a contact?',
                },
                {
                  mapToName: 'pronoun',
                  mapToDisplayName: 'Pronoun(2)',
                  prompt: 'WHICH field do you use to track the pronouns of a contact?',
                }
              ],
              companies: [
                {
                  mapToName: 'territory',
                  mapToDisplayName: 'Sales Territory',
                  prompt: 'Which field do you use to track the sales territory of a company?',
                }
              ]
            }}
            onInstallSuccess={(installationId, configObject) =>
              console.log(
                `Successfully installed ${installationId} with configuration ${JSON.stringify(
                  configObject,
                  null,
                  2
                )}`
              )
            }
            onUpdateSuccess={(installationId, configObject) =>
              console.log(
                `Successfully updated ${installationId} with configuration ${JSON.stringify(
                  configObject,
                  null,
                  2
                )}`
              )
            }
          />
        </div>
      </div>
    </AmpersandProvider>
  );
}

export default App;
