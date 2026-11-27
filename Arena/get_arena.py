import requests
import json

# === KONFIGURATION (SUPABASE) ===
SUPABASE_URL = "https://supabase.co"
SUPABASE_KEY = "sb_publishable_Glsjq8qWUE8XFjTQSTXvw_y3Oz3a5e"

# === DATEN AUS DEINEM CURL-BEFEHL ===
NEXTERS_URL = "https://nextersglobal.com"
HEADERS = {
    'accept': '*/*',
    'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://hero-wars.com',
    'referer': 'https://hero-wars.com/',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 OPR/136.0.0.0',
    'x-auth-application-id': '3',
    'x-auth-network-ident': 'web',
    'x-auth-player-id': '350258418',
    'x-auth-session-id': '0to84u00bb871d',
    'x-auth-signature': '1f39d6e538ff094486f6f3c07a24f71b',
    'x-auth-token': 'ps-tbhQTBNKCdZJvXlcmOYpizxaj+wMsLfW/eyIUVnDFSPEuG-1794209397-27.130.167.172-27fcf374de67fcfeaf53efd838a17ff0',
    'x-auth-user-id': '10790893',
    'x-env-library-version': '1',
    'x-env-unique-session-id': '7525459651516246523',
    'x-env-unique-session-uuid': '605e7dca-eef6-4f5f-bcff-61db8942d8e9',
    'x-requested-with': 'XMLHttpRequest'
}

PAYLOAD = {
    "calls": [
        {
            "name": "topGet",
            "args": {"type": "arena", "extraId": 0, "serverId": 588},
            "ident": "group_1_body"
        }
    ]
}

def fetch_and_push():
    print("[T800] Rufe Live-Daten von Nexters ab...")
    response = requests.post(NEXTERS_URL, headers=HEADERS, json=PAYLOAD)
    
    print(f"[T800] Nexters antwortet mit HTTP-Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"[!] Server-Fehler. Rückgabe-Text:\n{response.text}")
        return

    try:
        data = response.json()
    except Exception:
        print(f"[!] Server lieferte kein gültiges JSON. Antwort-Text war:\n{response.text}")
        return
    
    try:
        results = data["results"]
        top_list = None
        for res in results:
            if "result" in res and "response" in res["result"] and "top" in res["result"]["response"]:
                top_list = res["result"]["response"]["top"]
                break
        
        if not top_list:
            print("[!] Keine Ranglisten-Daten in der Antwort gefunden.")
            return

        top20 = [{"rank": i + 1, "user_id": p["userId"]} for i, p in enumerate(top_list[:20])]
        print(f"[T800] Top 20 geladen. Aktualisiere Cloud...")
        
        # In einem Rutsh über POST mit resolution=merge-duplicates überschreiben
        supabase_url = f"{SUPABASE_URL}/rest/v1/arena_rankings"
        supabase_headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        post_response = requests.post(supabase_url, headers=supabase_headers, json=top20)
        print(f"[T800] Synchronisation fertig! Supabase-Status: {post_response.status_code}")

    except Exception as e:
        print(f"[!] Verarbeitungsfehler: {e}")

if __name__ == "__main__":
    fetch_and_push()
