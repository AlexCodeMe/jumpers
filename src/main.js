import { k } from "./init.js";
import { setBackgroundColor } from "./scenes/room-utils.js";
import { room1 } from "./scenes/room1.js";
import { room2 } from "./scenes/room2.js";
import { createNotificationBox } from "./ui/notification-box.js";

async function main() {
  const room1Data = await (await fetch("./maps/room1.json")).json();
  const room2Data = await (await fetch("./maps/room2.json")).json();

  k.scene("room1", (prevSceneData) => {
    room1(k, room1Data, prevSceneData);
  });

  k.scene("room2", (prevSceneData) => {
    room2(k, room2Data, prevSceneData);
  });
}

k.scene("intro", () => {
  setBackgroundColor(k, "#a0214a");
  k.add(
    createNotificationBox(
      k,
      "Escape the factory!\nUser arrow keys to move, x to jump and z to attack"
    )
  );
  k.onKeyPress("enter", () => {
    k.go("room1", { exitName: null });
  });
});

k.scene("final-exit", () => {
  setBackgroundColor(k, "#a0214a");
  createNotificationBox(
    k,
    "You've made it to the final exit!\n Thanks for playing!"
  );
});

k.go("intro");

main();
