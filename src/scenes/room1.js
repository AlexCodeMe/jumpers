import { createBoss } from "../entities/boss.js";
import { createCartridge } from "../entities/cartridge.js";
import { createDrone } from "../entities/drone.js";
import { createPlayer } from "../entities/player.js";
import { state } from "../state/global-state.js";
import { healthBar } from "../ui/health-bar.js";
import {
  setBackgroundColor,
  setColliders,
  setCameraZones,
  setCameraControls,
  setExitZones,
} from "./room-utils.js";

export function room1(k, roomData, prevSceneData) {
  setBackgroundColor(k, "#a2aed5");

  k.camScale(4);
  k.camPos(170, 100);
  k.setGravity(1000);

  const layers = roomData.layers;

  const map = k.add([k.pos(0, 0), k.sprite("room1")]);

  const colliders = layers.find((layer) => layer.name === "colliders").objects;
  const positions = layers.find((layer) => layer.name === "positions").objects;
  const cameras = layers.find((layer) => layer.name === "cameras").objects;
  const exits = layers.find((layer) => layer.name === "exits").objects;

  setColliders(k, map, colliders);
  setCameraZones(k, map, cameras);

  const player = k.add(createPlayer(k));
  setCameraControls(k, player, map, roomData);
  setExitZones(k, map, exits, "room2");

  for (const pos of positions) {
    if (pos.name === "player" && !prevSceneData.exitName) {
      player.setPosition(pos.x, pos.y);
      player.setControls();
      player.setEvents();
      player.enablePassthrough();
      player.respawnIfOutOfBounds(1000, "room1");
      continue;
    }

    if (
      pos.name === "entrance-1" &&
      prevSceneData.exitName === "exit-1"
    ) {
      player.setPosition(pos.x, pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room1");
      k.camPos(player.pos);
      continue;
    }

    if (
      pos.name === "entrance-2" &&
      prevSceneData.exitName === "exit-2"
    ) {
      player.setPosition(pos.x, pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room1");
      k.camPos(player.pos);
      continue;
    }

    if (pos.type === "drone") {
      const drone = map.add(createDrone(k, k.vec2(pos.x, pos.y)));
      drone.setBehavior();
      drone.setEvents();
      continue;
    }

    if (pos.name === "boss" && !state.current().isBossDefeated) {
      const boss = map.add(createBoss(k, k.vec2(pos.x, pos.y)));
      boss.setBehavior();
      boss.setEvents();
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
