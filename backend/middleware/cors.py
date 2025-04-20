from typing import Callable
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

class CORSHandlerMiddleware(BaseHTTPMiddleware):
    """
    Custom CORS middleware that handles preflight OPTIONS requests
    and ensures proper CORS headers are set on all responses.
    """
    
    def __init__(self, app: FastAPI):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable):
        # Handle OPTIONS request
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response.headers["Access-Control-Max-Age"] = "86400"  # 24 hours
            return response
            
        # Process regular request
        response = await call_next(request)
        
        # Ensure CORS headers are also set on all other responses
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        return response

def setup_cors(app: FastAPI):
    """
    Configure and add both FastAPI's built-in CORS middleware and our custom middleware
    """
    # Standard FastAPI CORS middleware (handles most cases)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # For development; in production, specify exact domains
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    
    # Our custom middleware for additional CORS handling
    app.add_middleware(CORSHandlerMiddleware)
    
    return app 