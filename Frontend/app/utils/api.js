export async function simulate(data){
    try{
        const res= await fetch("http://localhost:6969/simulate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        const result = await res.json();
        return result;

    }
    catch(err){
        console.error("Error in API call:", err);
        throw err; // Re-throw the error to be handled by the caller
    }
}