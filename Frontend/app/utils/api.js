const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function simulate(data){
    try{
        const res= await fetch(`${BACKEND_URL}/simulate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Simulate request failed (${res.status}): ${text}`);
        }
        const result = await res.json();
        return result;

    }
    catch(err){
        console.error("Error in API call:", err);
        throw err; // Re-throw the error to be handled by the caller
    }
}