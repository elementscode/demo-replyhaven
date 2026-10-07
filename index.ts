import { App } from "@elements/app";
import config from "#config";
import queue from "#app/pages/queue";
import signin from "#app/pages/signin";
import team from "#app/pages/team";
import invite from "#app/pages/invite";
import canned from "#app/pages/canned";
import dashboard from "#app/pages/dashboard";
import contact from "#app/pages/contact";
import ticket from "#app/pages/ticket";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";
import { clearThisHost } from "#app/shared/services/tickets";

const app = new App();

app.route("/", queue);
app.route("/tickets/:number", ticket);
app.route("/dashboard", dashboard);
app.route("/canned", canned);
app.route("/team", team);
app.route("/invite/:token", invite);
app.route("/signin", signin);
app.route("/contact", contact);

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

app.start(config);

// Viewer rows this host left behind when it last stopped.
clearThisHost();
