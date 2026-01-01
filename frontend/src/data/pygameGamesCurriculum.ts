/**
 * 파이게임 만들기 커리큘럼
 * 실제 게임 제작 예제 (15개)
 */

export interface GameActivity {
  id: string;
  title: string;
  description: string;
  difficulty: '초급' | '중급' | '고급';
  exampleCode: string;
  hints: string[];
  concepts: string[];
}

export interface GameLevel {
  level: number;
  title: string;
  description: string;
  activities: GameActivity[];
}

export const pygameGamesCurriculum: GameLevel[] = [
  {
    level: 1,
    title: '레벨 1 - 기초 게임',
    description: '간단한 게임 메커니즘을 배웁니다',
    activities: [
      {
        id: '1-1',
        title: '사과 먹기 게임',
        description: '플레이어가 사과를 먹으면 점수가 올라가는 게임',
        difficulty: '초급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 1-1 사과 먹기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

def main():
    player_size = 50
    player_x = WIDTH // 2
    player_y = HEIGHT // 2
    player_speed = 5

    apple_size = 30
    apple_x = random.randint(0, WIDTH - apple_size)
    apple_y = random.randint(0, HEIGHT - apple_size)

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed
        if keys[pygame.K_UP]:
            player_y -= player_speed
        if keys[pygame.K_DOWN]:
            player_y += player_speed

        player_x = max(0, min(WIDTH - player_size, player_x))
        player_y = max(0, min(HEIGHT - player_size, player_y))

        player_rect = pygame.Rect(player_x, player_y, player_size, player_size)
        apple_rect = pygame.Rect(apple_x, apple_y, apple_size, apple_size)

        if player_rect.colliderect(apple_rect):
            score += 1
            apple_x = random.randint(0, WIDTH - apple_size)
            apple_y = random.randint(0, HEIGHT - apple_size)

        screen.fill(WHITE)
        pygame.draw.rect(screen, GREEN, player_rect)
        pygame.draw.rect(screen, RED, apple_rect)

        text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '방향키로 플레이어를 움직입니다',
          'colliderect()로 충돌을 감지합니다',
          '사과를 먹으면 새로운 위치에 생성됩니다',
        ],
        concepts: ['pygame 기본 구조', '키보드 입력', '충돌 감지', '랜덤 위치 생성'],
      },
      {
        id: '1-2',
        title: '장애물 피하기',
        description: '떨어지는 장애물을 피하는 게임',
        difficulty: '초급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 1-2 장애물 피하기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

def main():
    player_w, player_h = 50, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 7

    obstacle_w, obstacle_h = 40, 40
    obstacle_x = random.randint(0, WIDTH - obstacle_w)
    obstacle_y = -obstacle_h
    obstacle_speed = 5

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        obstacle_y += obstacle_speed

        if obstacle_y > HEIGHT:
            obstacle_y = -obstacle_h
            obstacle_x = random.randint(0, WIDTH - obstacle_w)
            score += 1

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)
        obstacle_rect = pygame.Rect(obstacle_x, obstacle_y, obstacle_w, obstacle_h)

        if player_rect.colliderect(obstacle_rect):
            running = False

        screen.fill(WHITE)
        pygame.draw.rect(screen, RED, player_rect)
        pygame.draw.rect(screen, BLUE, obstacle_rect)

        text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '장애물이 화면 아래로 떨어집니다',
          '장애물을 피하면 점수가 올라갑니다',
          '충돌하면 게임이 종료됩니다',
        ],
        concepts: ['객체 이동', '화면 경계 처리', '게임 오버 조건'],
      },
      {
        id: '1-3',
        title: '떨어지는 별 피하기',
        description: '떨어지는 별을 피하면서 점수를 올리는 게임',
        difficulty: '초급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 1-3 떨어지는 별 피하기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

def main():
    player_w, player_h = 60, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 7

    star_size = 20
    star_x = random.randint(0, WIDTH - star_size)
    star_y = -star_size
    star_speed = 5

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        star_y += star_speed

        if star_y > HEIGHT:
            star_y = -star_size
            star_x = random.randint(0, WIDTH - star_size)
            score += 1

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)
        star_rect = pygame.Rect(star_x, star_y, star_size, star_size)

        if player_rect.colliderect(star_rect):
            running = False

        screen.fill(BLACK)
        pygame.draw.rect(screen, RED, player_rect)
        pygame.draw.rect(screen, YELLOW, star_rect)

        text = font.render(f"Score: {score}", True, WHITE)
        screen.blit(text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '별이 화면 아래로 떨어집니다',
          '별을 피하면 점수가 올라갑니다',
          '별에 맞으면 게임 오버',
        ],
        concepts: ['게임 루프', '충돌 감지', '점수 시스템'],
      },
    ],
  },
  {
    level: 2,
    title: '레벨 2 - 중급 게임',
    description: '더 복잡한 게임 메커니즘을 배웁니다',
    activities: [
      {
        id: '2-1',
        title: '여러 장애물 피하기',
        description: '여러 개의 장애물을 동시에 피하는 게임',
        difficulty: '중급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 2-1 여러 장애물 피하기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GRAY = (100, 100, 100)

def main():
    player_w, player_h = 60, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 8

    block_w, block_h = 40, 40
    blocks = []
    BLOCK_COUNT = 7

    def spawn_block():
        x = random.randint(0, WIDTH - block_w)
        y = random.randint(-HEIGHT, -block_h)
        speed = random.randint(3, 7)
        return [x, y, speed]

    for _ in range(BLOCK_COUNT):
        x, y, speed = spawn_block()
        blocks.append([x, y, speed])

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)

        for b in blocks:
            b[1] += b[2]
            if b[1] > HEIGHT:
                score += 1
                b[0], b[1], b[2] = spawn_block()

        for b in blocks:
            block_rect = pygame.Rect(b[0], b[1], block_w, block_h)
            if player_rect.colliderect(block_rect):
                running = False

        screen.fill(WHITE)
        pygame.draw.rect(screen, RED, player_rect)
        for b in blocks:
            pygame.draw.rect(screen, GRAY, (b[0], b[1], block_w, block_h))

        text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '여러 개의 장애물이 동시에 떨어집니다',
          '각 장애물은 다른 속도로 움직입니다',
          '리스트로 여러 객체를 관리합니다',
        ],
        concepts: ['리스트 활용', '다중 객체 관리', '함수 활용'],
      },
      {
        id: '2-2',
        title: '좌우로 움직이는 적 피하기',
        description: '좌우로 움직이는 적을 피하는 게임',
        difficulty: '중급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 2-2 좌우로 움직이는 적 피하기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

def main():
    player_w, player_h = 60, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 8

    enemy_w, enemy_h = 50, 50
    enemies = []
    ENEMY_COUNT = 5

    for i in range(ENEMY_COUNT):
        x = random.randint(0, WIDTH - enemy_w)
        y = i * 120
        direction = random.choice([-1, 1])
        speed = random.randint(2, 5)
        enemies.append([x, y, direction, speed])

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed
        if keys[pygame.K_UP]:
            player_y -= player_speed
        if keys[pygame.K_DOWN]:
            player_y += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))
        player_y = max(0, min(HEIGHT - player_h, player_y))

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)

        for e in enemies:
            e[0] += e[2] * e[3]
            if e[0] <= 0 or e[0] >= WIDTH - enemy_w:
                e[2] *= -1

        for e in enemies:
            enemy_rect = pygame.Rect(e[0], e[1], enemy_w, enemy_h)
            if player_rect.colliderect(enemy_rect):
                running = False

        score += 1

        screen.fill(WHITE)
        pygame.draw.rect(screen, RED, player_rect)
        for e in enemies:
            pygame.draw.rect(screen, BLUE, (e[0], e[1], enemy_w, enemy_h))

        text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '방향키로 상하좌우 이동이 가능합니다',
          '적이 좌우로 왕복 운동을 합니다',
          '벽에 닿으면 방향이 바뀝니다',
        ],
        concepts: ['방향 전환', '왕복 운동', '경계 충돌'],
      },
      {
        id: '2-3',
        title: '타이머가 있는 사과 먹기',
        description: '제한 시간 내에 최대한 많은 사과를 먹는 게임',
        difficulty: '중급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 2-3 타이머가 있는 사과 먹기")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

def main():
    player_size = 50
    player_x = WIDTH // 2
    player_y = HEIGHT // 2
    player_speed = 5

    apple_size = 30
    apple_x = random.randint(0, WIDTH - apple_size)
    apple_y = random.randint(0, HEIGHT - apple_size)

    score = 0
    time_limit = 30
    start_time = pygame.time.get_ticks()
    running = True

    while running:
        clock.tick(60)

        elapsed_time = (pygame.time.get_ticks() - start_time) // 1000
        remaining_time = time_limit - elapsed_time

        if remaining_time <= 0:
            running = False

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed
        if keys[pygame.K_UP]:
            player_y -= player_speed
        if keys[pygame.K_DOWN]:
            player_y += player_speed

        player_x = max(0, min(WIDTH - player_size, player_x))
        player_y = max(0, min(HEIGHT - player_size, player_y))

        player_rect = pygame.Rect(player_x, player_y, player_size, player_size)
        apple_rect = pygame.Rect(apple_x, apple_y, apple_size, apple_size)

        if player_rect.colliderect(apple_rect):
            score += 1
            apple_x = random.randint(0, WIDTH - apple_size)
            apple_y = random.randint(0, HEIGHT - apple_size)

        screen.fill(WHITE)
        pygame.draw.rect(screen, GREEN, player_rect)
        pygame.draw.rect(screen, RED, apple_rect)

        score_text = font.render(f"Score: {score}", True, BLACK)
        time_text = font.render(f"Time: {remaining_time}", True, BLACK)
        screen.blit(score_text, (10, 10))
        screen.blit(time_text, (10, 50))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '30초 제한 시간이 있습니다',
          'pygame.time.get_ticks()로 시간을 측정합니다',
          '시간이 0이 되면 게임이 종료됩니다',
        ],
        concepts: ['타이머 구현', '시간 측정', '제한 시간'],
      },
      {
        id: '2-4',
        title: '목숨 3개 피하기 게임',
        description: '목숨이 3개 있는 장애물 피하기 게임',
        difficulty: '중급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 2-4 목숨 3개 피하기 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

def main():
    player_w, player_h = 50, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 7

    obstacle_w, obstacle_h = 40, 40
    obstacle_x = random.randint(0, WIDTH - obstacle_w)
    obstacle_y = -obstacle_h
    obstacle_speed = 5

    score = 0
    lives = 3
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        obstacle_y += obstacle_speed

        if obstacle_y > HEIGHT:
            obstacle_y = -obstacle_h
            obstacle_x = random.randint(0, WIDTH - obstacle_w)
            score += 1

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)
        obstacle_rect = pygame.Rect(obstacle_x, obstacle_y, obstacle_w, obstacle_h)

        if player_rect.colliderect(obstacle_rect):
            lives -= 1
            obstacle_y = -obstacle_h
            obstacle_x = random.randint(0, WIDTH - obstacle_w)
            if lives <= 0:
                running = False

        screen.fill(WHITE)
        pygame.draw.rect(screen, RED, player_rect)
        pygame.draw.rect(screen, BLUE, obstacle_rect)

        score_text = font.render(f"Score: {score}", True, BLACK)
        lives_text = font.render(f"Lives: {lives}", True, BLACK)
        screen.blit(score_text, (10, 10))
        screen.blit(lives_text, (10, 50))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '목숨이 3개로 시작합니다',
          '장애물에 맞으면 목숨이 1개 감소합니다',
          '목숨이 0이 되면 게임 오버',
        ],
        concepts: ['생명 시스템', '재시작 로직', '게임 상태 관리'],
      },
      {
        id: '2-5',
        title: '속도 증가 피하기 게임',
        description: '시간이 지날수록 장애물 속도가 빨라지는 게임',
        difficulty: '중급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 2-5 속도 증가 피하기 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

def main():
    player_w, player_h = 60, 20
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 50
    player_speed = 7

    star_size = 20
    star_x = random.randint(0, WIDTH - star_size)
    star_y = -star_size
    star_speed = 3

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        star_y += star_speed

        if star_y > HEIGHT:
            star_y = -star_size
            star_x = random.randint(0, WIDTH - star_size)
            score += 1
            if score % 5 == 0:
                star_speed += 0.5

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)
        star_rect = pygame.Rect(star_x, star_y, star_size, star_size)

        if player_rect.colliderect(star_rect):
            running = False

        screen.fill(BLACK)
        pygame.draw.rect(screen, RED, player_rect)
        pygame.draw.rect(screen, YELLOW, star_rect)

        score_text = font.render(f"Score: {score}", True, WHITE)
        speed_text = font.render(f"Speed: {star_speed:.1f}", True, WHITE)
        screen.blit(score_text, (10, 10))
        screen.blit(speed_text, (10, 50))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '5점마다 장애물 속도가 0.5씩 증가합니다',
          '점수가 높아질수록 난이도가 올라갑니다',
          '현재 속도가 화면에 표시됩니다',
        ],
        concepts: ['난이도 조절', '동적 속도 변경', '점수 기반 이벤트'],
      },
    ],
  },
  {
    level: 3,
    title: '레벨 3 - 고급 게임',
    description: '복잡한 게임 메커니즘과 고급 기능을 배웁니다',
    activities: [
      {
        id: '3-1',
        title: '우주선 슈팅 게임',
        description: '우주선으로 적을 쏘는 슈팅 게임',
        difficulty: '고급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 3-1 우주선 슈팅 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

def main():
    player_w, player_h = 50, 50
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 80
    player_speed = 7

    bullets = []
    bullet_speed = 10

    enemies = []
    enemy_spawn_timer = 0

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bullets.append([player_x + player_w // 2 - 2, player_y])

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        for b in bullets:
            b[1] -= bullet_speed
        bullets = [b for b in bullets if b[1] > 0]

        enemy_spawn_timer += 1
        if enemy_spawn_timer > 60:
            enemy_x = random.randint(0, WIDTH - 40)
            enemies.append([enemy_x, -40, 3])
            enemy_spawn_timer = 0

        for e in enemies:
            e[1] += e[2]
        enemies = [e for e in enemies if e[1] < HEIGHT]

        for e in enemies[:]:
            for b in bullets[:]:
                e_rect = pygame.Rect(e[0], e[1], 40, 40)
                b_rect = pygame.Rect(b[0], b[1], 4, 10)
                if e_rect.colliderect(b_rect):
                    if e in enemies:
                        enemies.remove(e)
                    if b in bullets:
                        bullets.remove(b)
                    score += 10

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)
        for e in enemies:
            e_rect = pygame.Rect(e[0], e[1], 40, 40)
            if player_rect.colliderect(e_rect):
                running = False

        screen.fill(BLACK)
        pygame.draw.rect(screen, GREEN, player_rect)

        for b in bullets:
            pygame.draw.rect(screen, WHITE, (b[0], b[1], 4, 10))

        for e in enemies:
            pygame.draw.rect(screen, RED, (e[0], e[1], 40, 40))

        score_text = font.render(f"Score: {score}", True, WHITE)
        screen.blit(score_text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '스페이스바로 총알을 발사합니다',
          '적을 맞추면 10점을 얻습니다',
          '적과 충돌하면 게임 오버',
        ],
        concepts: ['발사 시스템', '충돌 처리', '적 생성 타이머'],
      },
      {
        id: '3-2',
        title: '2인용 탁구(Pong)',
        description: '두 명이 함께 즐기는 탁구 게임',
        difficulty: '고급',
        exampleCode: `import pygame
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 3-2 2인용 탁구")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

def main():
    paddle_w, paddle_h = 20, 100
    left_x, left_y = 30, HEIGHT // 2 - paddle_h // 2
    right_x, right_y = WIDTH - 30 - paddle_w, HEIGHT // 2 - paddle_h // 2
    paddle_speed = 7

    ball_size = 20
    ball_x, ball_y = WIDTH // 2, HEIGHT // 2
    ball_vx, ball_vy = 5, 5

    score_left = 0
    score_right = 0

    running = True
    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_w]:
            left_y -= paddle_speed
        if keys[pygame.K_s]:
            left_y += paddle_speed
        if keys[pygame.K_UP]:
            right_y -= paddle_speed
        if keys[pygame.K_DOWN]:
            right_y += paddle_speed

        left_y = max(0, min(HEIGHT - paddle_h, left_y))
        right_y = max(0, min(HEIGHT - paddle_h, right_y))

        ball_x += ball_vx
        ball_y += ball_vy

        if ball_y < 0 or ball_y > HEIGHT - ball_size:
            ball_vy *= -1

        ball_rect = pygame.Rect(ball_x, ball_y, ball_size, ball_size)
        left_rect = pygame.Rect(left_x, left_y, paddle_w, paddle_h)
        right_rect = pygame.Rect(right_x, right_y, paddle_w, paddle_h)

        if ball_rect.colliderect(left_rect) and ball_vx < 0:
            ball_vx *= -1
        if ball_rect.colliderect(right_rect) and ball_vx > 0:
            ball_vx *= -1

        if ball_x < 0:
            score_right += 1
            ball_x, ball_y = WIDTH // 2, HEIGHT // 2
        if ball_x > WIDTH:
            score_left += 1
            ball_x, ball_y = WIDTH // 2, HEIGHT // 2

        screen.fill(BLACK)
        pygame.draw.rect(screen, WHITE, left_rect)
        pygame.draw.rect(screen, WHITE, right_rect)
        pygame.draw.rect(screen, WHITE, ball_rect)

        score_text = font.render(f"{score_left} : {score_right}", True, WHITE)
        screen.blit(score_text, (WIDTH // 2 - 40, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '왼쪽 플레이어: W/S 키로 조작',
          '오른쪽 플레이어: 방향키 위/아래로 조작',
          '공이 화면 밖으로 나가면 상대방 점수 증가',
        ],
        concepts: ['2인용 게임', '공 물리', '패들 충돌', '점수 시스템'],
      },
      {
        id: '3-3',
        title: '타이핑 게임',
        description: '떨어지는 글자를 타이핑하는 게임',
        difficulty: '고급',
        exampleCode: `import pygame
import random
import sys
import string

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 3-3 타이핑 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 60)
small_font = pygame.font.SysFont(None, 30)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

def new_letter():
    ch = random.choice(string.ascii_uppercase)
    x = random.randint(50, WIDTH - 50)
    y = -50
    speed = random.randint(2, 5)
    return [ch, x, y, speed]

def main():
    letters = [new_letter() for _ in range(3)]
    score = 0
    missed = 0

    running = True
    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                key_name = pygame.key.name(event.key).upper()
                if len(key_name) == 1 and key_name.isalpha():
                    for lt in letters:
                        if lt[0] == key_name:
                            score += 1
                            letters.remove(lt)
                            letters.append(new_letter())
                            break

        for lt in letters[:]:
            lt[2] += lt[3]
            if lt[2] > HEIGHT:
                missed += 1
                letters.remove(lt)
                letters.append(new_letter())
                if missed >= 10:
                    running = False

        screen.fill(BLACK)
        for lt in letters:
            ch, x, y, _ = lt
            text = font.render(ch, True, WHITE)
            screen.blit(text, (x, y))

        score_text = small_font.render(f"Score: {score}", True, WHITE)
        miss_text = small_font.render(f"Missed: {missed}/10", True, WHITE)
        screen.blit(score_text, (10, 10))
        screen.blit(miss_text, (10, 40))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '떨어지는 글자와 같은 키를 누르세요',
          '10개를 놓치면 게임 오버',
          '각 글자마다 다른 속도로 떨어집니다',
        ],
        concepts: ['키보드 이벤트', '문자열 처리', '리스트 조작'],
      },
      {
        id: '3-4',
        title: '보스가 나오는 슈팅 게임',
        description: '20점 달성 시 보스가 등장하는 슈팅 게임',
        difficulty: '고급',
        exampleCode: `import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 600, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 3-4 보스 슈팅 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 40)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

def main():
    player_w, player_h = 50, 50
    player_x = WIDTH // 2 - player_w // 2
    player_y = HEIGHT - 80
    player_speed = 7

    bullets = []
    bullet_speed = 10

    enemies = []
    enemy_spawn_timer = 0

    boss_rect = pygame.Rect(WIDTH // 2 - 60, -120, 120, 80)
    boss_hp = 30
    boss_speed = 1
    boss_alive = False

    score = 0
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bullets.append([player_x + player_w // 2 - 2, player_y])

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT]:
            player_x += player_speed

        player_x = max(0, min(WIDTH - player_w, player_x))

        for b in bullets:
            b[1] -= bullet_speed
        bullets = [b for b in bullets if b[1] > 0]

        if score >= 20 and not boss_alive:
            boss_alive = True
            boss_rect.x = WIDTH // 2 - 60
            boss_rect.y = -120
            boss_hp = 30

        if boss_alive:
            if boss_rect.y < 50:
                boss_rect.y += boss_speed

            for b in bullets[:]:
                b_rect = pygame.Rect(b[0], b[1], 4, 10)
                if b_rect.colliderect(boss_rect):
                    boss_hp -= 1
                    if b in bullets:
                        bullets.remove(b)
                    if boss_hp <= 0:
                        boss_alive = False
                        score += 100

        if not boss_alive:
            enemy_spawn_timer += 1
            if enemy_spawn_timer > 60:
                enemy_x = random.randint(0, WIDTH - 40)
                enemies.append([enemy_x, -40, 3])
                enemy_spawn_timer = 0

            for e in enemies:
                e[1] += e[2]
            enemies = [e for e in enemies if e[1] < HEIGHT]

            for e in enemies[:]:
                for b in bullets[:]:
                    e_rect = pygame.Rect(e[0], e[1], 40, 40)
                    b_rect = pygame.Rect(b[0], b[1], 4, 10)
                    if e_rect.colliderect(b_rect):
                        if e in enemies:
                            enemies.remove(e)
                        if b in bullets:
                            bullets.remove(b)
                        score += 10

        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)

        if boss_alive and player_rect.colliderect(boss_rect):
            running = False

        for e in enemies:
            e_rect = pygame.Rect(e[0], e[1], 40, 40)
            if player_rect.colliderect(e_rect):
                running = False

        screen.fill(BLACK)
        pygame.draw.rect(screen, GREEN, player_rect)

        for b in bullets:
            pygame.draw.rect(screen, WHITE, (b[0], b[1], 4, 10))

        for e in enemies:
            pygame.draw.rect(screen, RED, (e[0], e[1], 40, 40))

        if boss_alive:
            pygame.draw.rect(screen, BLUE, boss_rect)
            hp_text = font.render(f"Boss HP: {boss_hp}", True, WHITE)
            screen.blit(hp_text, (WIDTH // 2 - 80, 50))

        score_text = font.render(f"Score: {score}", True, WHITE)
        screen.blit(score_text, (10, 10))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '20점 달성 시 보스가 등장합니다',
          '보스는 HP가 30이며 총알로 공격해야 합니다',
          '보스를 처치하면 100점을 얻습니다',
        ],
        concepts: ['보스 시스템', '체력 관리', '게임 단계', '조건부 생성'],
      },
      {
        id: '3-5',
        title: '난이도 상승 타이핑 게임',
        description: '10초마다 레벨이 올라가는 타이핑 게임',
        difficulty: '고급',
        exampleCode: `import pygame
import random
import sys
import string

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("레벨 3-5 난이도 상승 타이핑 게임")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 60)
small_font = pygame.font.SysFont(None, 30)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

def new_letter():
    ch = random.choice(string.ascii_uppercase)
    x = random.randint(50, WIDTH - 50)
    y = -50
    speed = random.randint(2, 5)
    return [ch, x, y, speed]

def main():
    letters = [new_letter() for _ in range(3)]
    score = 0
    missed = 0
    level = 1
    timer = 0

    running = True
    while running:
        clock.tick(60)
        timer += 1

        if timer % (60 * 10) == 0:
            level += 1
            letters.append(new_letter())
            for lt in letters:
                lt[3] += 1

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                key_name = pygame.key.name(event.key).upper()
                if len(key_name) == 1 and key_name.isalpha():
                    for lt in letters:
                        if lt[0] == key_name:
                            score += 1
                            letters.remove(lt)
                            letters.append(new_letter())
                            break

        for lt in letters[:]:
            lt[2] += lt[3]
            if lt[2] > HEIGHT:
                missed += 1
                letters.remove(lt)
                letters.append(new_letter())
                if missed >= 10:
                    running = False

        screen.fill(BLACK)
        for lt in letters:
            ch, x, y, _ = lt
            text = font.render(ch, True, WHITE)
            screen.blit(text, (x, y))

        score_text = small_font.render(f"Score: {score}", True, WHITE)
        miss_text = small_font.render(f"Missed: {missed}/10", True, WHITE)
        level_text = small_font.render(f"Level: {level}", True, WHITE)
        screen.blit(score_text, (10, 10))
        screen.blit(miss_text, (10, 40))
        screen.blit(level_text, (10, 70))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
        hints: [
          '10초마다 레벨이 올라갑니다',
          '레벨업 시 글자가 1개 추가되고 속도가 증가합니다',
          '시간이 지날수록 점점 어려워집니다',
        ],
        concepts: ['레벨 시스템', '시간 기반 이벤트', '동적 난이도'],
      },
    ],
  },
];

export const gameConceptExplanations: { [key: string]: string } = {
  'pygame 기본 구조': `
    Pygame 게임의 기본 구조:
    1. pygame.init() - Pygame 초기화
    2. screen = pygame.display.set_mode() - 화면 생성
    3. clock = pygame.time.Clock() - FPS 제어
    4. while running: - 게임 루프
    5. pygame.quit() - Pygame 종료
  `,
  '키보드 입력': `
    키보드 입력 처리:
    - pygame.key.get_pressed() - 현재 눌린 키 확인
    - keys[pygame.K_LEFT] - 왼쪽 화살표 키
    - keys[pygame.K_RIGHT] - 오른쪽 화살표 키
    - keys[pygame.K_UP] - 위쪽 화살표 키
    - keys[pygame.K_DOWN] - 아래쪽 화살표 키
  `,
  '충돌 감지': `
    충돌 감지 방법:
    - pygame.Rect() - 사각형 영역 생성
    - rect1.colliderect(rect2) - 두 사각형이 겹치는지 확인
    - 충돌 시 True 반환, 아니면 False 반환
    - 게임에서 플레이어와 아이템, 적과의 충돌 감지에 사용
  `,
  '랜덤 위치 생성': `
    무작위 위치 생성:
    - import random 필요
    - random.randint(a, b) - a부터 b까지의 정수 반환
    - 예: random.randint(0, WIDTH-50) - 화면 너비 내 랜덤 x좌표
    - 아이템, 적의 생성 위치를 다양하게 만들 때 사용
  `,
  '객체 이동': `
    객체 이동 원리:
    - y 좌표 증가 → 아래로 이동
    - y 좌표 감소 → 위로 이동
    - x 좌표 증가 → 오른쪽으로 이동
    - x 좌표 감소 → 왼쪽으로 이동
    - 속도 변수로 이동 속도 조절
  `,
  '화면 경계 처리': `
    화면 경계 처리:
    - if y > HEIGHT: - 화면 아래로 벗어남
    - if y < 0: - 화면 위로 벗어남
    - if x > WIDTH: - 화면 오른쪽으로 벗어남
    - if x < 0: - 화면 왼쪽으로 벗어남
    - 벗어난 객체를 다시 화면 안으로 이동
  `,
  '게임 오버 조건': `
    게임 종료 조건:
    - running = False - 게임 루프 종료
    - 충돌 발생 시, 시간 초과 시, 목표 달성 시 등
    - pygame.quit() - Pygame 종료
    - sys.exit() - 프로그램 완전 종료
  `,
  '게임 루프': `
    게임 루프 구조:
    - while running: - 게임이 실행되는 동안 반복
    - 이벤트 처리 → 게임 로직 → 화면 그리기
    - clock.tick(60) - 초당 60프레임으로 제한
    - pygame.display.flip() - 화면 업데이트
  `,
  '점수 시스템': `
    점수 시스템 구현:
    - score = 0 - 점수 변수 초기화
    - score += 1 - 점수 증가
    - font.render(f"Score: {score}", True, color) - 점수 표시
    - 화면에 blit()으로 그리기
  `,
  '리스트 활용': `
    리스트로 여러 객체 관리:
    - enemies = [] - 빈 리스트 생성
    - enemies.append([x, y, speed]) - 객체 추가
    - for enemy in enemies: - 모든 객체 순회
    - 여러 적, 총알, 아이템을 동시에 관리
  `,
  '다중 객체 관리': `
    여러 객체 동시 관리:
    - 리스트에 객체 정보 저장
    - for 루프로 모든 객체 업데이트
    - 각 객체마다 다른 속도, 위치 가능
    - 동적으로 객체 추가/제거 가능
  `,
  '함수 활용': `
    함수로 코드 정리:
    - def spawn_enemy(): - 적 생성 함수
    - 반복되는 코드를 함수로 만들기
    - 코드 재사용성 향상
    - 유지보수 쉬워짐
  `,
  '방향 전환': `
    방향 전환 구현:
    - direction 변수로 이동 방향 저장 (-1: 왼쪽, 1: 오른쪽)
    - 벽에 닿으면 direction *= -1로 방향 반전
    - x += direction * speed로 이동
    - 좌우 왕복 운동 구현
  `,
  '왕복 운동': `
    왕복 운동 패턴:
    - 화면 경계에 닿으면 방향 전환
    - if x <= 0 or x >= WIDTH: direction *= -1
    - 일정 범위 내에서 반복 이동
    - 적, 플랫폼 등에 활용
  `,
  '경계 충돌': `
    경계 충돌 감지:
    - 객체가 화면 경계에 닿았는지 확인
    - 왼쪽: x <= 0
    - 오른쪽: x >= WIDTH - object_width
    - 위: y <= 0
    - 아래: y >= HEIGHT - object_height
  `,
  '타이머 구현': `
    타이머 구현 방법:
    - pygame.time.get_ticks() - 게임 시작 후 경과 시간(밀리초)
    - start_time = pygame.time.get_ticks() - 시작 시간 저장
    - elapsed = (get_ticks() - start_time) // 1000 - 경과 시간(초)
    - 제한 시간, 쿨다운 등에 활용
  `,
  '시간 측정': `
    시간 측정 기법:
    - pygame.time.get_ticks() - 밀리초 단위 시간
    - // 1000으로 초 단위 변환
    - remaining_time = limit - elapsed - 남은 시간 계산
    - 타이머, 스코어 보너스 등에 사용
  `,
  '제한 시간': `
    제한 시간 시스템:
    - time_limit = 30 - 제한 시간 설정
    - 경과 시간 계산
    - remaining_time = limit - elapsed
    - if remaining_time <= 0: 게임 종료
  `,
  '생명 시스템': `
    생명(목숨) 시스템:
    - lives = 3 - 초기 목숨 개수
    - 충돌 시 lives -= 1
    - if lives <= 0: 게임 오버
    - 화면에 남은 목숨 표시
  `,
  '재시작 로직': `
    재시작 로직 구현:
    - 충돌 후 객체 위치 초기화
    - 목숨 감소 후 게임 계속
    - 완전한 게임 오버 vs 재시작 구분
    - 무적 시간 추가 가능
  `,
  '게임 상태 관리': `
    게임 상태 관리:
    - 점수, 목숨, 레벨 등 변수로 관리
    - 상태에 따라 다른 동작 수행
    - 게임 진행, 일시정지, 게임 오버 등
    - 상태 전환 로직 구현
  `,
  '난이도 조절': `
    난이도 조절 시스템:
    - 점수/시간에 따라 난이도 증가
    - 속도, 개수, 크기 등 조절
    - if score % 5 == 0: speed += 0.5
    - 플레이어에게 도전감 제공
  `,
  '동적 속도 변경': `
    동적 속도 변경:
    - 게임 진행 중 속도 변수 수정
    - speed += 0.5 - 점진적 증가
    - speed *= 1.1 - 비율로 증가
    - 난이도 곡선 조절
  `,
  '점수 기반 이벤트': `
    점수 기반 이벤트:
    - if score % 10 == 0: - 10점마다 이벤트
    - 특정 점수 도달 시 보상/변화
    - 레벨업, 속도 증가, 아이템 생성 등
    - 게임에 변화와 목표 제공
  `,
  '발사 시스템': `
    발사 시스템 구현:
    - 스페이스바 입력 감지
    - bullets 리스트에 총알 추가
    - bullets.append([x, y]) - 현재 위치에서 발사
    - 총알 이동 및 화면 밖 제거
  `,
  '충돌 처리': `
    충돌 처리 시스템:
    - 총알과 적 충돌 감지
    - 이중 for 루프로 모든 조합 확인
    - 충돌 시 양쪽 객체 제거
    - 점수 증가 등 효과 적용
  `,
  '적 생성 타이머': `
    적 생성 타이머:
    - timer += 1 - 매 프레임 증가
    - if timer > 60: - 1초마다 (60 FPS 기준)
    - 적 생성 후 timer = 0 초기화
    - 일정 간격으로 적 생성
  `,
  '2인용 게임': `
    2인용 게임 구현:
    - 두 개의 플레이어 객체 생성
    - 각각 다른 키로 조작 (W/S vs 방향키)
    - 독립적인 위치와 상태 관리
    - 대전 또는 협동 게임 가능
  `,
  '공 물리': `
    공 물리 시뮬레이션:
    - ball_vx, ball_vy - 공의 속도 벡터
    - ball_x += ball_vx - 속도만큼 이동
    - 벽 충돌 시 ball_vy *= -1 (반사)
    - 패들 충돌 시 ball_vx *= -1
  `,
  '패들 충돌': `
    패들 충돌 처리:
    - 공과 패들의 충돌 감지
    - ball_vx < 0 조건으로 방향 확인
    - 충돌 시 공의 x 방향 반전
    - 중복 충돌 방지
  `,
  '키보드 이벤트': `
    키보드 이벤트 처리:
    - pygame.KEYDOWN - 키를 누른 순간
    - event.key - 눌린 키 코드
    - pygame.key.name(event.key) - 키 이름
    - 타이핑, 메뉴 선택 등에 활용
  `,
  '문자열 처리': `
    문자열 처리:
    - string.ascii_uppercase - 대문자 A-Z
    - random.choice(string) - 랜덤 문자 선택
    - .upper() - 대문자 변환
    - .isalpha() - 알파벳 확인
  `,
  '리스트 조작': `
    리스트 조작 기법:
    - letters.remove(item) - 항목 제거
    - letters.append(item) - 항목 추가
    - for item in list[:] - 복사본으로 순회
    - 순회 중 안전한 수정
  `,
  '보스 시스템': `
    보스 시스템 구현:
    - boss_alive 플래그로 상태 관리
    - 특정 조건에서 보스 등장 (점수 20점)
    - 보스 전용 HP, 크기, 패턴
    - 보스 처치 시 큰 보상
  `,
  '체력 관리': `
    체력(HP) 관리:
    - boss_hp = 30 - 초기 체력
    - 공격 받을 때 boss_hp -= 1
    - if boss_hp <= 0: 처치 처리
    - 화면에 체력 바 표시
  `,
  '게임 단계': `
    게임 단계 시스템:
    - 일반 적 단계 → 보스 단계
    - 점수/시간 기반 단계 전환
    - 각 단계별 다른 로직
    - 단계 클리어 보상
  `,
  '조건부 생성': `
    조건부 객체 생성:
    - if score >= 20: 보스 생성
    - if not boss_alive: 일반 적 생성
    - 게임 상태에 따라 다른 객체 생성
    - 동적 게임 진행
  `,
  '레벨 시스템': `
    레벨 시스템 구현:
    - level = 1 - 초기 레벨
    - 시간/점수 기반 레벨업
    - 레벨에 따라 난이도 조절
    - 레벨 표시 UI
  `,
  '시간 기반 이벤트': `
    시간 기반 이벤트:
    - timer += 1 - 프레임 카운터
    - if timer % (60 * 10) == 0: - 10초마다
    - 일정 시간마다 이벤트 발생
    - 레벨업, 아이템 생성 등
  `,
  '동적 난이도': `
    동적 난이도 조절:
    - 시간에 따라 자동 난이도 증가
    - 글자 개수 증가, 속도 증가
    - 플레이어 실력에 맞춰 조절
    - 지속적인 도전감 제공
  `,
};

