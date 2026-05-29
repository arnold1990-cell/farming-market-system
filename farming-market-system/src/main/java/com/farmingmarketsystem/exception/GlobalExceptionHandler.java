package com.farmingmarketsystem.exception;

import org.springframework.http.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String,Object>> notFound(ResourceNotFoundException ex){ return body(HttpStatus.NOT_FOUND, ex.getMessage()); }
    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String,Object>> badRequest(RuntimeException ex){ return body(HttpStatus.BAD_REQUEST, ex.getMessage()); }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String,Object>> unauthorized(UnauthorizedException ex){ return body(HttpStatus.FORBIDDEN, ex.getMessage()); }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String,Object>> badCredentials(BadCredentialsException ex){ return body(HttpStatus.UNAUTHORIZED, "Invalid email or password"); }
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String,Object>> disabled(DisabledException ex){ return body(HttpStatus.FORBIDDEN, "User account is disabled"); }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String,Object>> auth(AuthenticationException ex){ return body(HttpStatus.UNAUTHORIZED, "Invalid email or password"); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){
        String msg = ex.getBindingResult().getFieldErrors().stream().findFirst().map(f -> f.getField()+" "+f.getDefaultMessage()).orElse("Validation error");
        return body(HttpStatus.BAD_REQUEST, msg);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> generic(Exception ex){
        ex.printStackTrace();
        String message = ex.getMessage() == null || ex.getMessage().isBlank() ? "Unexpected error" : ex.getMessage();
        return body(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
    private ResponseEntity<Map<String,Object>> body(HttpStatus status, String message){
        Map<String,Object> m=new LinkedHashMap<>(); m.put("status", status.value()); m.put("message", message); return ResponseEntity.status(status).body(m);
    }
}
