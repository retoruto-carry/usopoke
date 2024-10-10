import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";
import { LastFmTrack, searchTracks } from "~/services/lastfm.server";
import { getEnv } from "~/utils/getEnv.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const LAST_FM_API_KEY = getEnv(context).LAST_FM_API_KEY;
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q");

  // 初回ロードでは検索しない
  const tracks = searchQuery ? await searchTracks(LAST_FM_API_KEY, searchQuery) : [];
  return json({ tracks });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const trackUrl = formData.get("trackUrl");
  const trackName = formData.get("trackName");

  if (!trackUrl || !trackName) {
    return json({ error: "Track URL and name are required." }, { status: 400 });
  }

  // TODO: 保存処理
  return null
};

export default function MusicPage() {
  const { tracks } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  return (
    <div>
      <h1>楽曲検索と保存</h1>

      {/* 検索フォーム */}
      <Form method="get">
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="楽曲名を入力"
        />
        <button type="submit">検索</button>
      </Form>

      {/* 検索結果の表示 */}
      {tracks.length > 0 && (
        <ul>
          {tracks.map((track: LastFmTrack) => (
            <li key={track.url}>
              <p>{track.name} {track.artist}</p>
              <Form method="post">
                <input type="hidden" name="trackName" value={track.name} />
                <input type="hidden" name="trackArtist" value={track.artist} />
                <input type="hidden" name="trackUrl" value={track.url} />
                <button type="submit">保存</button>
              </Form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
