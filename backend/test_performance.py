"""
데이터베이스 성능 테스트 도구
최적화 전후 성능 비교
"""

import time
import statistics
from typing import List, Callable
import logging

# 동기식 모듈
import database

# 비동기식 모듈 (테스트용)
try:
    import database_async
    import asyncio
    ASYNC_AVAILABLE = True
except ImportError:
    ASYNC_AVAILABLE = False
    print("Warning: database_async not available, skipping async tests")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def measure_time(func: Callable, iterations: int = 10) -> dict:
    """함수 실행 시간 측정"""
    times = []

    for _ in range(iterations):
        start = time.perf_counter()
        func()
        end = time.perf_counter()
        times.append((end - start) * 1000)  # ms로 변환

    return {
        'min': min(times),
        'max': max(times),
        'avg': statistics.mean(times),
        'median': statistics.median(times),
        'stdev': statistics.stdev(times) if len(times) > 1 else 0
    }


async def measure_time_async(func: Callable, iterations: int = 10) -> dict:
    """비동기 함수 실행 시간 측정"""
    times = []

    for _ in range(iterations):
        start = time.perf_counter()
        await func()
        end = time.perf_counter()
        times.append((end - start) * 1000)

    return {
        'min': min(times),
        'max': max(times),
        'avg': statistics.mean(times),
        'median': statistics.median(times),
        'stdev': statistics.stdev(times) if len(times) > 1 else 0
    }


def test_error_statistics():
    """오류 통계 조회 성능 테스트"""
    logger.info("\n" + "="*60)
    logger.info("Testing: get_error_statistics()")
    logger.info("="*60)

    # 동기식 테스트
    logger.info("\n[Sync] Testing without cache warmup...")
    database.clear_cache()
    result_cold = measure_time(database.get_error_statistics, iterations=1)
    logger.info(f"Cold cache: {result_cold['avg']:.2f} ms")

    logger.info("[Sync] Testing with cache warmup (10 iterations)...")
    result_warm = measure_time(database.get_error_statistics, iterations=10)
    logger.info(f"Warm cache - Avg: {result_warm['avg']:.2f} ms, "
                f"Min: {result_warm['min']:.2f} ms, Max: {result_warm['max']:.2f} ms")

    speedup = result_cold['avg'] / result_warm['avg']
    logger.info(f"💡 Cache speedup: {speedup:.1f}x faster")

    # 비동기식 테스트
    if ASYNC_AVAILABLE:
        async def test_async():
            logger.info("\n[Async] Testing async version...")
            await database_async.clear_cache()
            result_async_cold = await measure_time_async(database_async.get_error_statistics, iterations=1)
            logger.info(f"Async cold cache: {result_async_cold['avg']:.2f} ms")

            result_async_warm = await measure_time_async(database_async.get_error_statistics, iterations=10)
            logger.info(f"Async warm cache - Avg: {result_async_warm['avg']:.2f} ms")

            speedup_async = result_async_cold['avg'] / result_async_warm['avg']
            logger.info(f"💡 Async cache speedup: {speedup_async:.1f}x faster")

        asyncio.run(test_async())


def test_analytics_overview():
    """분석 개요 조회 성능 테스트"""
    logger.info("\n" + "="*60)
    logger.info("Testing: get_analytics_overview()")
    logger.info("="*60)

    # 동기식 테스트
    logger.info("\n[Sync] Testing without cache warmup...")
    database.clear_cache()
    result_cold = measure_time(database.get_analytics_overview, iterations=1)
    logger.info(f"Cold cache: {result_cold['avg']:.2f} ms")

    logger.info("[Sync] Testing with cache warmup (10 iterations)...")
    result_warm = measure_time(database.get_analytics_overview, iterations=10)
    logger.info(f"Warm cache - Avg: {result_warm['avg']:.2f} ms, "
                f"Min: {result_warm['min']:.2f} ms, Max: {result_warm['max']:.2f} ms")

    speedup = result_cold['avg'] / result_warm['avg']
    logger.info(f"💡 Cache speedup: {speedup:.1f}x faster")


def test_error_reports_query():
    """오류 보고 목록 조회 성능 테스트"""
    logger.info("\n" + "="*60)
    logger.info("Testing: get_error_reports()")
    logger.info("="*60)

    # 다양한 LIMIT 값으로 테스트
    limits = [10, 50, 100]

    for limit in limits:
        logger.info(f"\n[Sync] Testing with LIMIT {limit}...")
        result = measure_time(lambda: database.get_error_reports(limit=limit), iterations=5)
        logger.info(f"Avg: {result['avg']:.2f} ms, Median: {result['median']:.2f} ms")


def test_device_distribution():
    """기기 분포 조회 성능 테스트"""
    logger.info("\n" + "="*60)
    logger.info("Testing: get_device_distribution()")
    logger.info("="*60)

    logger.info("\n[Sync] Testing without cache warmup...")
    database.clear_cache()
    result_cold = measure_time(database.get_device_distribution, iterations=1)
    logger.info(f"Cold cache: {result_cold['avg']:.2f} ms")

    logger.info("[Sync] Testing with cache warmup...")
    result_warm = measure_time(database.get_device_distribution, iterations=10)
    logger.info(f"Warm cache - Avg: {result_warm['avg']:.2f} ms")

    speedup = result_cold['avg'] / result_warm['avg']
    logger.info(f"💡 Cache speedup: {speedup:.1f}x faster")


def test_concurrent_requests():
    """동시 요청 성능 테스트"""
    logger.info("\n" + "="*60)
    logger.info("Testing: Concurrent Requests")
    logger.info("="*60)

    import threading

    def worker():
        database.get_error_statistics()

    # 10개의 동시 요청
    threads = []
    start = time.perf_counter()

    for _ in range(10):
        t = threading.Thread(target=worker)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    end = time.perf_counter()
    total_time = (end - start) * 1000

    logger.info(f"10 concurrent requests completed in: {total_time:.2f} ms")
    logger.info(f"Average per request: {total_time / 10:.2f} ms")


def print_summary():
    """성능 테스트 요약"""
    logger.info("\n" + "="*60)
    logger.info("PERFORMANCE TEST SUMMARY")
    logger.info("="*60)

    logger.info("""
주요 최적화 내용:
1. ✓ TTL 캐싱 추가 (5분 TTL, 최대 100개 항목)
2. ✓ 통계 쿼리 캐싱 (get_error_statistics, get_analytics_overview)
3. ✓ INSERT OR IGNORE로 중복 체크 최적화
4. ✓ 캐시 무효화 로직 추가

예상 성능 향상:
- 통계 쿼리: 10-50배 빠름 (캐시 히트 시)
- 동시 요청: 캐시로 인한 DB 부하 감소
- 중복 체크: 1개 쿼리 절약 (INSERT OR IGNORE 사용 시)

추가 권장 사항:
1. ⚡ 데이터베이스 최적화 스크립트 실행
   python optimize_database.py

2. ⚡ 비동기 버전 사용 고려
   - database_async.py로 마이그레이션
   - 연결 풀링으로 추가 성능 향상

3. ⚡ 프로덕션 환경 설정
   - Redis 캐시 서버 사용
   - 읽기 전용 복제본 추가
    """)

    logger.info("="*60)


def main():
    """메인 테스트 실행"""
    logger.info("="*60)
    logger.info("DATABASE PERFORMANCE TESTING")
    logger.info("="*60)

    # 각 테스트 실행
    test_error_statistics()
    test_analytics_overview()
    test_error_reports_query()
    test_device_distribution()
    test_concurrent_requests()

    # 요약 출력
    print_summary()


if __name__ == "__main__":
    main()
