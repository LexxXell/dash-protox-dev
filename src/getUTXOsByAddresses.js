async function getUTXOsByAddresses(addresses) {
  const baseUrl = "https://trpc.digitalcash.dev/";
  const basicAuth = Buffer.from(`user:pass`).toString("base64");
  const payload = JSON.stringify({
    method: "getaddressutxos",
    params: [
      {
        addresses: Array.isArray(addresses) ? addresses : [addresses],
      },
    ],
  });

  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!resp.ok) {
      console.error("Response status:", resp.status);
      console.error("Response text:", await resp.text());
      throw new Error(`HTTP error! Status: ${resp.status}`);
    }

    const data = await resp.json();
    if (data.error) {
      const err = new Error(data.error.message);
      Object.assign(err, data.error);
      throw err;
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching UTXOs:", error);
    throw error;
  }
}

module.exports = { getUTXOsByAddresses };
