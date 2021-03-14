import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import fetch from "node-fetch";
import { buffer } from "get-stream";

const COOKIE_KEY = '_strava4_session';
const cookieValue = process.env['_strava4_session'];
const cookieHeader = `${COOKIE_KEY}=${cookieValue}`;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const {
        colorType,
        x,
        y,
        z,
    } = req.params;

    const reqUrl = `https://personal-heatmaps-external.strava.com/tiles/9652598/${colorType}/${z}/${x}/${y}.png?filter_type=all&filter_start=2012-01-01&filter_end=2099-12-31&include_everyone=true`;

    const stravaResponse = await fetch(
        reqUrl,
        {
            headers: {
                'cookie': cookieHeader,
            }
        }
    );

    const bodyBuffer = await buffer(stravaResponse.body, { encoding: 'binary'});

    context.res = {
        status: stravaResponse.status,
        headers: Object.fromEntries(stravaResponse.headers.entries()),
        body: new Uint8Array(bodyBuffer),
        isRaw: true,
    };
};

export default httpTrigger;