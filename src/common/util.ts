
export interface JwtPayload {
    sub: number | null
}


export function parseJwt(token: string) : JwtPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export async function postJSONData(url = '', data = {}, auth_header= {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      ...auth_header,
      'Content-Type': 'application/json'
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
      .catch(e => {
          console.log(e);
      });
  if (typeof response === "object") {
      return response.json(); // parses JSON response into native JavaScript objects
  }
}

export async function getJSONData(url = '', auth_header= {}) { // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      ...auth_header,
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
  })
      .catch(e => {
          console.log(e);
      });
  if (typeof response === "object") {
      return response.json(); // parses JSON response into native JavaScript objects
  }
}

export function parse_query_variable(location: { search: string; }, name: string): string {
  let ret = "";
  if (location.search.split(`${name}=`)[1])
    ret = location.search.split(`${name}=`)[1].split("&")[0];
  return ret;
}

export function deep_copy(o: any): any {
  return JSON.parse(JSON.stringify(o));
}