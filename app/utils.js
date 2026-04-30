
function getCurrentDateTimeFormatted(){
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
}

function getCurrentDateFormatted(){
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  return (year + "-" + month + "-" + date );
}

async function isServerUp(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    const response = await fetch(url, { 
      method: 'HEAD', // Use HEAD to minimize data transfer
      signal: controller.signal 
    }).catch(() => {
        // Fallback to GET if HEAD is not supported
        return fetch(url, { signal: controller.signal });
    });
    clearTimeout(timeoutId);
    return true; // If we got any response, the server is reachable
  } catch (err) {
    console.error("Pre-flight check failed for " + url + ": " + err.message);
    return false;
  }
}

async function withRetry(fn, attempts = 3, delay = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const waitTime = delay * Math.pow(2, i);
      console.log(`Attempt ${i + 1} failed. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

module.exports = {getCurrentDateFormatted, getCurrentDateTimeFormatted, isServerUp, withRetry};