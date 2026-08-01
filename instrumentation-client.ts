import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/rfq",
      method: "POST",
      advancedOptions: {
        checkLevel: "basic",
      },
    },
  ],
});
