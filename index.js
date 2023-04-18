const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 50,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/knight/CowBoyIdle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 90,
    y: -30
  },
  sprites: {
    idle: {
      imageSrc: './img/knight/CowBoyIdle.png',
      framesMax: 7
    },
    run: {
      imageSrc: './img/knight/CowBoyWalking.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/knight/CowBoyIdle.png',
      framesMax: 7
    },
    fall: {
      imageSrc: './img/knight/CowBoyIdle.png',
      framesMax: 7
    },
    attack1: {
      imageSrc: './img/knight/CowBoyShoot.png',
      framesMax: 5
    },
    takeHit: {
      imageSrc: './img/knight/Take Hit.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/knight/CowBoyIdle.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 1000,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 1000,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/king/CowBoyIdle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: -30
  },
  sprites: {
    idle: {
      imageSrc: './img/king/CowBoyIdle.png',
      framesMax: 7
    },
    run: {
      imageSrc: './img/king/CowBoyWalking.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/king/CowBoyIdle.png',
      framesMax: 7
    },
    fall: {
      imageSrc: './img/king/CowBoyIdle.png',
      framesMax: 7
    },
    attack1: {
      imageSrc: './img/king/CowBoyShoot.png',
      framesMax: 5
    },
    takeHit: {
      imageSrc: './img/king/Take hit.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/king/CowBoyIdle.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -1000,
      y: 50
    },
    width: 1000,
    height: 50
  }
})

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
