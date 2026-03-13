export default async function handler(req, res) {
  // Alleen POST-verzoeken toestaan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, product } = req.body;

  // Basis e-mailvalidatie
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
        attributes: {
          PRODUCT_INTERESSE: product || 'Algemeen'
        }
      })
    });

    // 201 = nieuw contact, 204 = bestaand contact geüpdated → beide OK
    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      const data = await response.json();
      console.error('Brevo fout:', data);
      return res.status(500).json({ error: 'Brevo fout' });
    }
  } catch (err) {
    console.error('Server fout:', err);
    return res.status(500).json({ error: 'Server fout' });
  }
}
