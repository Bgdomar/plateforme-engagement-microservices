package com.pfe.userprofile.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    @Value("${app.upload.path:/app/assets/images}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    // ✅ CORS ajouté
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(urlPrefix + "**")
                .addResourceLocations("file:" + uploadPath + "/")
                .setCachePeriod(3600);
        log.info("📁 Resource handler configuré: {} -> file:{}/", urlPrefix, uploadPath);
    }
}