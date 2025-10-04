type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  body: string;
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const lead = JSON.parse(event.body ?? "{}");

    // TODO: Replace with CRM/Airtable/HubSpot/etc. webhook or storage of your choice.
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, received: lead }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
