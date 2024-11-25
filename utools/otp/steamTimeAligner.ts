
export default abstract class SteamTimeAligner {

  static url: string = "https://api.steampowered.com/ITwoFactorService/QueryTime/v1/";
  static params: RequestInit = {
    method: "POST",
    headers: { "Content-Length": "0" }
  };

  private static async getSteamTime(): Promise<number> {
    const controller: AbortController = new AbortController();
    const signal: AbortSignal = <AbortSignal>controller.signal;

    setTimeout(() => controller.abort(), 2000);

    const res: Response = await window.fetch(SteamTimeAligner.url, { ...SteamTimeAligner.params, signal });
    const json: Response = await res.json();
    // TODO
    console.log(json)
    return Number.parseInt(json.server_time, 10);
  }

  public static async getOffset(): Promise<number> {
    try {
      const steamTime: number = await SteamTimeAligner.getSteamTime();
      return steamTime - Date.now();
    } catch (err) {
      console.error(err.message);
      return 0;
    }
  }
}
