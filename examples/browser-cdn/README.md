# Browser example with CDN imports

This example loads `mdb-reader` and the `Buffer` polyfill from jsDelivr as ES modules. It requires an internet connection, but no npm install or build step.

From this directory, start a static HTTP server, for example with Python 3:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>, select an `.mdb` or `.accdb` file, and click **Load table names**. The selected database is read locally in your browser.

The CDN imports pin exact published package versions. This example uses the published `mdb-reader` package rather than your local checkout.

For an example using npm dependencies and Parcel, see [`../browser`](../browser).
