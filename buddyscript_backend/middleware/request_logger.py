import time
import logging

logger = logging.getLogger(__name__)

class RequestLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = round(time.time() - start, 3)
        user = request.user if request.user.is_authenticated else "Anonymous"
        logger.info(f"{request.method} {request.path} by {user} - {duration}s")
        response["X-Response-Time"] = f"{duration}s"
        return response
