
const SPOTIFY_CLIENT_ID: string = `b3fc46a61fa94c8781550156ed0a9b50`;
//const SPOTIFY_CLIENT_SECRET_ID = `0f8f9d874cef434a96172b6bb8f6835e`;
const redirectUri: string = `http://localhost:3000`;



function generateRandomString(length: number): string {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    function base64encode(string: Uint8Array): string {
        return btoa(String.fromCharCode.apply(null, Array.from(string)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return base64encode(new Uint8Array(digest));
}

const codeVerifier: string = generateRandomString(128);

let urlParams = new URLSearchParams();

if (typeof window !== "undefined") {
    urlParams = new URLSearchParams(window.location.search);
}

export const authorize =  () => {
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
        const state: string = generateRandomString(16);
        const scope: string =
            "user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state";

        sessionStorage.setItem("code_verifier", codeVerifier);

        const args = new URLSearchParams({
            response_type: "code",
            client_id: SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
        });

        window.location.href = "https://accounts.spotify.com/authorize?" + args;
    });

    
};

    export const getToken = () => {
    const codeVerifier = sessionStorage.getItem("code_verifier");

    const  body = new URLSearchParams({
        grant_type: "authorization_code" || "",
        code: urlParams.get("code") || "",
        redirect_uri: redirectUri || "",
        client_id: SPOTIFY_CLIENT_ID || "",
        code_verifier: codeVerifier || "",
    });
            fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body,
        })

//         return response.json();
//     } catch (error) {
//         window.location.href = "/";
//     }
// };

 // const refreshSpotifyToken = async (refresh_token: string) => {
 //    const body = new URLSearchParams({
 //        grant_type: "refresh_token" || "",
 //        refresh_token: refresh_token,
 //        client_id: SPOTIFY_CLIENT_ID || "",
 //    });
 //           const response = await fetch("https://accounts.spotify.com/api/token", {
 //            method: "POST",
 //            headers: {
 //                "Content-Type": "application/x-www-form-urlencoded",
 //            },
 //            body:body,
 //        })
        .then((response) => {

            if (!response.ok) {
                throw new Error("HTTP Status " + response.status);           
        }

        return response.json();
    })
    .then((data:{access_token: string}) => {
        sessionStorage.setItem("access_token", data.access_token);
        
    })


    .catch((error) => {
        console.error("Error:", error);
    });
};
