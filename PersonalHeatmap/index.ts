import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import fetch, { Response } from "node-fetch";
import { buffer } from "get-stream";
import { URL, URLSearchParams } from "url";

const COOKIE_KEY = "_strava4_session";
const cookieValue = process.env["_strava4_session"];
const cookieHeader = `${COOKIE_KEY}=${cookieValue}`;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { colorType, x, y, z } = req.params;

  const reqUrl = new URL(
    `https://personal-heatmaps-external.strava.com/tiles/9652598/${colorType}/${z}/${x}/${y}.png?filter_type=all&filter_start=2012-01-01&filter_end=2099-12-31&include_everyone=true`
  );
  const queryParams = new URLSearchParams(req.query);
  queryParams.forEach((value, key) => {
    reqUrl.searchParams.set(key, value);
  })
  const reqUrlString = reqUrl.toString();

  context.log(`[Personal Heatmap] url: ${reqUrlString}`);

  const stravaResponse = await fetch(reqUrlString, {
    headers: {
      cookie: cookieHeader,
    },
  });

  const bodyBuffer = await buffer(stravaResponse.body, { encoding: "binary" });

  if (!stravaResponse.ok) {
    context.log.error(
      `[Personal Heatmap] request error: ${bodyBuffer.toString("utf-8")}`
    );
  }

  const stravaHeaders = Object.fromEntries(stravaResponse.headers.entries());

  context.res = {
    status: stravaResponse.status,
    headers: {
      "content-type": stravaHeaders["content-type"],
      // prettier-ignore
      "connection": stravaHeaders["connection"],
    },
    body: new Uint8Array(bodyBuffer),
    isRaw: true,
  };
};

export default httpTrigger;
