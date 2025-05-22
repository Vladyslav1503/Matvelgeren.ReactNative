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

export async function searchProducts(searchQuery: string) {
    const url = `https://xnlsonryzrsoncdgxows.supabase.co/functions/v1/search_product_by_name`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json', // Add this header
                'Authorization': `Bearer REMOVED`,
            },
            body: JSON.stringify({
                search: searchQuery,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn("Search API returned non-200:", response.status, errorText);
            throw new Error(`Search API Error: ${errorText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to search products:", err);
        throw err;
    }
}