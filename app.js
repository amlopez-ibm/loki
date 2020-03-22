const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const port = 8080;

const morgan = require("morgan");
const winston = require("./config/winston");
const rp = require("request-promise");

if (process.env.NODE_ENV === "dev") {
  require("dotenv").config();
}
const config = {
  ttr: parseInt(process.env.OC_CONFIG_TTR || 0),
  varMilliseconds: parseInt(process.env.OC_CONFIG_VARMILLISECONDS || 5),
  http400: parseInt(process.env.OC_CONFIG_HTTP400 || 0),
  http500: parseInt(process.env.OC_CONFIG_HTTP500 || 0),
  urlArray: process.env.OC_CONFIG_URLS
    ? process.env.OC_CONFIG_URLS.split(",")
    : [],
  responseArr: [],
  responseIterator: 0,
  isPangea: Boolean(process.env.OC_CONFIG_IS_PANGEA)
};

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function generateResponseArray() {
  for (let i = 0; i < 100; i++) {
    if (i < config.http400) {
      config.responseArr[i] = 418;
    } else if (i < config.http400 + config.http500) {
      config.responseArr[i] = 500;
    } else {
      config.responseArr[i] = 200;
    }
  }
  shuffle(config.responseArr);
}

function randomizedTTR() {
  return (
    Math.round(Math.random() * (2 * config.varMilliseconds)) -
    config.varMilliseconds +
    config.ttr
  );
}

function getStatus() {
  const status = config.responseArr[config.responseIterator];
  config.responseIterator++;
  if (config.responseIterator >= config.responseArr.length) {
    config.responseIterator = 0;
    shuffle(config.responseArr);
  }
  return status;
}

generateResponseArray();

app.use(
  morgan(
    '{ "loki-tst": ":date[iso]", "ip": ":remote-addr", "status": :status, "ttr": :response-time, "url": ":url", "tipo": "loki-app"}',
    //':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]',
    //":date[iso] :http-version :method :status :remote-addr :req[host] :url :res[content-length] :response-time",
    {
      stream: winston.stream
    }
  )
);

function getRandomInt(min, max) {
  return Math.min(max, Math.floor(Math.random() * (max - min + 1) + min));
}

const getURL = `var xhr = new XMLHttpRequest();
xhr.open('GET', u);
xhr.onload = function() {
    if (xhr.status === 200) {
      document.getElementById("response_"+i).innerHTML = xhr.responseText;
    }
    else {
      document.getElementById("response_"+i).innerHTML = "<span style='color: red;'>ERROR!</span>&nbsp;&nbsp;&nbsp;" + xhr.status + " " + xhr.responseText;
    }
};
xhr.send();
`;

function drawFront() {
  return (
    "<html>" +
    "<head><title>Pangea</title></head>" +
    "<script>function getURL(i, u) { " +
    getURL +
    " }</script>" +
    "<body>" +
    config.urlArray
      .map((u, i) => {
        return (
          "<div style='border: dashed 1px black; width: 80%; margin: 5%; padding: 5%; text-align: left;'><button style='background-color:#e3e2e1; width: 100px;height: 50px;' onClick='getURL(" +
          i +
          ',"/step?step=' +
          +i +
          "\")'>Step " +
          (i + 1) +
          "</button>&nbsp;&nbsp;&nbsp;<span id='response_" +
          i +
          "'></span></div>"
        );
      })
      .join("") +
    "</body></html>"
  );
}

app.get("/step", (req, res) => {
  const callArray = [config.urlArray[parseInt(req.query.step)]];
  let response = "";
  const requestPromises = Promise.all(callArray.map(url => rp(url)))
    .then(r => {
      response = r;
      status = getStatus();
    })
    .catch(e => {
      status = e.statusCode ? e.statusCode : 500;
    });

  setTimeout(() => {
    requestPromises.finally(() => {
      res.status(status);
      res.send(
        callArray[0]
          .split("/")[2]
          .substring(0, callArray[0].split("/")[2].indexOf("-service")) +
          ": " +
          status +
          " - " +
          JSON.stringify(response)
      );
    });
  }, randomizedTTR());
});

app.get("/", (req, res) => {
  const callArray =
    config.isPangea && config.urlArray.length > 0
      ? [config.urlArray[getRandomInt(0, config.urlArray.length - 1)]]
      : config.urlArray;
  const requestPromises = Promise.all(callArray.map(url => rp(url)))
    .then(() => {
      status = getStatus();
    })
    .catch(e => {
      status = e.statusCode ? e.statusCode : 500;
    });

  setTimeout(() => {
    requestPromises.finally(() => {
      res.status(status);
      res.send(
        config.isPangea ? drawFront() : "random response " + Math.random()
      );
    });
  }, randomizedTTR());
});

app.get("/config", (req, res) => {
  if (req.query.http400 && !isNaN(parseInt(req.query.http400))) {
    config.http400 = parseInt(req.query.http400);
  }
  if (req.query.http500 && !isNaN(parseInt(req.query.http500))) {
    config.http500 = parseInt(req.query.http500);
  }

  if (req.query.ttr && !isNaN(parseInt(req.query.ttr))) {
    config.ttr = parseInt(req.query.ttr);
  }

  if (req.query.urls && req.query.urls.split(",").length > 0) {
    config.urlArray = req.query.urls.split(",");
  }

  generateResponseArray();

  res.status(200);
  res.send(
    "OK - HTTP400: " +
      config.http400 +
      " % - HTTP500: " +
      config.http500 +
      " % - TTR: " +
      config.ttr
  );
});

app.listen(port, () => {
  console.log("App listening in http://localhost:" + port);
});
