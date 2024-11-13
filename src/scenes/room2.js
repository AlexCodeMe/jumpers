import { createCartridge } from "../entities/cartridge";
import { createPlayer } from "../entities/player";
import { healthBar } from "../ui/health-bar";
import {
  setBackgroundColor,
  setCameraControls,
  setCameraZones,
  setColliders,
  setExitZones,
} from "./room-utils";

export function room2(k, roomData, prevSceneData) {
  setBackgroundColor(k, "#a2aed5");

  k.camScale(4);
  k.camPos(170, 100);
  k.setGravity(1000);

  const layers = roomData.layers;
  const map = k.add([k.pos(0, 0), k.sprite("room2")]);

  const colliders = layers.find((layer) => layer.name === "colliders").objects;
  const positions = layers.find((layer) => layer.name === "positions").objects;
  const cameras = layers.find((layer) => layer.name === "cameras").objects;
  const exits = layers.find((layer) => layer.name === "exits").objects;

  setColliders(k, map, colliders);
  setCameraZones(k, map, cameras);

  const player = k.add(createPlayer(k));
  setCameraControls(k, player, map, roomData);
  setExitZones(k, map, exits, "room1");

  for (const pos of positions) {
    if (
      pos.name === "entrance-1" &&
      prevSceneData.exitName === "exit-1"
    ) {
      player.setPosition(pos.x + map.pos.x, pos.y + map.pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      continue;
    }

    if (
      pos.name === "entrance-2" &&
      prevSceneData.exitName === "exit-2"
    ) {
      player.setPosition(pos.x + map.pos.x, pos.y + map.pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room2", { exitName: "exit-2" });
      k.camPos(player.pos);
      continue;
    }

    if (pos.type === "cartridge") {
      map.add(createCartridge(k, k.vec2(pos.x, pos.y)));
    }
  }

  healthBar.setEvents();
  healthBar.trigger("update");
  k.add(healthBar);
}
