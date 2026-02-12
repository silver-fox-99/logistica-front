export async function runLimited<T>(
    tasks: Array<() => Promise<T>>,
    limit = 5
): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = [];
    let idx = 0;

    const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
        while (idx < tasks.length) {
            const i = idx++;
            try {
                const value = await tasks[i]();
                results[i] = { status: "fulfilled", value };
            } catch (reason) {
                results[i] = { status: "rejected", reason };
            }
        }
    });

    await Promise.all(workers);
    return results;
}
