import { state, stateProps } from "../state/global-state";
import { healthBar } from "../ui/health-bar";
import { makeBlink } from "./shared-logic";

export function createPlayer(k) {
  return k.make([
    k.pos(),
    k.sprite("player"),
    k.area({
      shape: new k.Rect(k.vec2(0, 18), 12, 12),
    }),
    k.anchor("center"),
    k.body({ mass: 100, jumpForce: 320 }),
    k.doubleJump(state.current().isDoubleJumpUnlocked ? 2 : 1),
    k.opacity(),
    k.health(state.current().playerHp),
    "player",
    {
      speed: 150,
      isAttacking: false,
      setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
      },
      enablePassthrough() {
        this.onBeforePhysicsResolve((collision) => {
          if (collision.target.is("passthrough") && this.isJumping()) {
            collision.preventResolution();
          }
        });
      },
      setControls() {
        this.controlHandlers = [];

        this.controlHandlers.push(
          k.onKeyPress((key) => {
            if (key === "x") {
              if (this.curAnim() !== "jump") {
                this.play("jump");
              }
              this.doubleJump();
            }
            if (key === "z" && this.curAnim() !== "attack") {
              this.isAttacking = true;
              this.add([
                k.pos(this.flipX ? -25 : 0, 10),
                k.area({ shape: new k.Rect(k.vec2(0), 25, 10) }),
                "sword-hitbox",
              ]);
              this.play("attack");
              this.onAnimEnd((anim) => {
                if (anim === "attack") {
                  const swordHitbox = k.get("sword-hitbox", {
                    recursive: true,
                  })[0];
                  if (swordHitbox) {
                    k.destroy(swordHitbox);
                  }
                  this.isAttacking = false;
                  this.play("idle");
                }
              });
            }
          })
        );

        this.controlHandlers.push(
          k.onKeyDown((key) => {
            if (key === "left" && !this.isAttacking) {
              if (this.curAnim() !== "run" && this.isGrounded()) {
                this.play("run");
              }
              this.flipX = true;
              this.move(-this.speed, 0);
              return;
            }

            if (key === "right" && !this.isAttacking) {
              if (this.curAnim() !== "run" && this.isGrounded()) {
                this.play("run");
              }
              this.flipX = false;
              this.move(this.speed, 0);
              return;
            }
          })
        );

        this.controlHandlers.push(
          k.onKeyRelease((key) => {
            if (
              this.curAnim() !== "idle" &&
              this.curAnim !== "jump" &&
              this.curAnim !== "fall" &&
              this.curAnim !== "attack"
            ) {
              this.play("idle");
            }
          })
        );
      },
      disableControls() {
        for (const handler of this.controlHandlers) {
          handler.cancel();
        }
      },
      respawnIfOutOfBounds(
        boundValue,
        destinationName,
        prevSceneData = { exitName: null }
      ) {
        k.onUpdate(() => {
          if (this.pos.y > boundValue) {
            k.go(destinationName, prevSceneData);
          }
        });
      },
      setEvents() {
        this.onFall(() => {
          this.play("fall");
        });
        this.onFallOff(() => {
          this.play("fall");
        });
        this.onGround(() => {
          this.play("idle");
        });
        this.onHeadbutt(() => {
          this.play("fall");
        });

        this.on("heal", () => {
          state.set(stateProps.playerHp, this.hp());
          healthBar.trigger("update");
        });

        this.on("hurt", () => {
          makeBlink(k, this);
          if (this.hp() > 0) {
            state.set(stateProps.playerHp, this.hp());
            healthBar.trigger("update");
            return;
          }

          state.set(stateProps.playerHp, state.current().maxPlayerHp);
          k.play("boom");
          this.play("explode");
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") {
            k.go("room1", { exitName: null });
          }
        });
      },
      enableDoubleJump() {
        this.numJumps = 2;
      },
    },
  ]);
}