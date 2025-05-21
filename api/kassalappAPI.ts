export async function fetchProductByEAN(ean: string) {
    const url = `https://xnlsonryzrsoncdgxows.supabase.co/functions/v1/get-product-by-ean?ean=${encodeURIComponent(ean)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer REMOVED`, // or import your Supabase key here
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn("API returned non-200:", response.status, errorText);
            throw new Error(`API Error: ${errorText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to fetch product:", err);
        throw err;
    }
}
