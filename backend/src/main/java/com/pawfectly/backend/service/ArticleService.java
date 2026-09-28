package com.pawfectly.backend.service;

import com.pawfectly.backend.dto.ArticleDto;
import com.pawfectly.backend.entity.Article;
import com.pawfectly.backend.exception.ResourceNotFoundException;
import com.pawfectly.backend.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    @PostConstruct
    public void ensureActiveArticles() {
        try {
            List<Article> articles = articleRepository.findAll();
            boolean changed = false;
            for (Article a : articles) {
                if (a.getIsActive() == null || !a.getIsActive()) {
                    a.setIsActive(true);
                    changed = true;
                }
                String t = a.getTitle() != null ? a.getTitle().toLowerCase() : "";
                String currentCat = a.getCategory();
                String targetCat = currentCat;
                if (currentCat == null || currentCat.isBlank() || currentCat.equalsIgnoreCase("Preventive Care") || currentCat.equalsIgnoreCase("General")) {
                    if (t.contains("nutrition") || t.contains("food") || t.contains("diet")) {
                        targetCat = "Nutrition";
                    } else if (t.contains("vaccin") || t.contains("shot")) {
                        targetCat = "Vaccination";
                    } else if (t.contains("groom") || t.contains("bath") || t.contains("wash")) {
                        targetCat = "Grooming";
                    } else if (t.contains("sign") || t.contains("sick") || t.contains("emergenc")) {
                        targetCat = "Emergency Care";
                    } else if (t.contains("cat") || t.contains("indoor") || t.contains("play") || t.contains("behaviour") || t.contains("behavior")) {
                        targetCat = "Behaviour";
                    } else if (t.contains("senior") || t.contains("aging") || t.contains("old")) {
                        targetCat = "Senior Pet Care";
                    } else if (t.contains("prevent") || t.contains("flea") || t.contains("tick") || t.contains("dental") || t.contains("checkup")) {
                        targetCat = "Preventive Care";
                    }
                }
                if (targetCat != null && !targetCat.equalsIgnoreCase(currentCat)) {
                    a.setCategory(targetCat);
                    changed = true;
                }
            }
            if (changed) {
                articleRepository.saveAll(articles);
                log.info("Initialized and normalized {} articles with active status and correct categories", articles.size());
            }
        } catch (Exception e) {
            log.warn("Could not auto-activate or normalize articles: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ArticleDto> getArticles(String petType, String category, Boolean featured, String search) {
        List<Article> articles = articleRepository.findAll();

        // Only active articles are visible publicly
        articles = articles.stream()
                .filter(a -> a.getIsActive() == null || Boolean.TRUE.equals(a.getIsActive()))
                .collect(Collectors.toList());

        if (featured != null && featured) {
            articles = articles.stream().filter(a -> Boolean.TRUE.equals(a.getIsFeatured())).collect(Collectors.toList());
        }

        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All") && !category.equalsIgnoreCase("All Tips")) {
            articles = articles.stream()
                    .filter(a -> a.getCategory() != null && a.getCategory().equalsIgnoreCase(category.trim()))
                    .collect(Collectors.toList());
        }

        if (petType != null && !petType.isBlank() && !petType.equalsIgnoreCase("All") && !petType.equalsIgnoreCase("All Tips")) {
            articles = articles.stream()
                    .filter(a -> a.getPetType() != null && a.getPetType().equalsIgnoreCase(petType.trim()))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase().trim();
            articles = articles.stream()
                    .filter(a -> (a.getTitle() != null && a.getTitle().toLowerCase().contains(lower)) ||
                            (a.getContent() != null && a.getContent().toLowerCase().contains(lower)) ||
                            (a.getCategory() != null && a.getCategory().toLowerCase().contains(lower)))
                    .collect(Collectors.toList());
        }

        return articles.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ArticleDto getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        return mapToDto(article);
    }

    @Transactional
    public ArticleDto createArticle(ArticleDto dto) {
        Article article = Article.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .imageUrl(dto.getImageUrl())
                .petType(dto.getPetType())
                .category(dto.getCategory() != null ? dto.getCategory() : "Preventive Care")
                .excerpt(dto.getExcerpt())
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .publishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt() : LocalDateTime.now())
                .build();

        Article saved = articleRepository.save(article);
        log.info("Created article: {}", saved.getTitle());
        return mapToDto(saved);
    }

    @Transactional
    public ArticleDto updateArticle(Long id, ArticleDto dto) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));

        if (dto.getTitle() != null) article.setTitle(dto.getTitle());
        if (dto.getContent() != null) article.setContent(dto.getContent());
        if (dto.getImageUrl() != null) article.setImageUrl(dto.getImageUrl());
        if (dto.getPetType() != null) article.setPetType(dto.getPetType());
        if (dto.getCategory() != null) article.setCategory(dto.getCategory());
        if (dto.getExcerpt() != null) article.setExcerpt(dto.getExcerpt());
        if (dto.getIsFeatured() != null) article.setIsFeatured(dto.getIsFeatured());
        if (dto.getIsActive() != null) article.setIsActive(dto.getIsActive());
        if (dto.getPublishedAt() != null) article.setPublishedAt(dto.getPublishedAt());

        Article updated = articleRepository.save(article);
        log.info("Updated article id: {}", id);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        articleRepository.delete(article);
        log.info("Deleted article id: {}", id);
    }

    private ArticleDto mapToDto(Article article) {
        String imgUrl = article.getImageUrl();
        if (imgUrl == null || !imgUrl.startsWith("http")) {
            imgUrl = resolveCloudinaryArticleImage(article.getTitle(), article.getCategory());
        }
        return ArticleDto.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .imageUrl(imgUrl)
                .petType(article.getPetType())
                .category(article.getCategory() != null ? article.getCategory() : "Preventive Care")
                .excerpt(article.getExcerpt())
                .isFeatured(article.getIsFeatured())
                .isActive(article.getIsActive() != null ? article.getIsActive() : true)
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private String resolveCloudinaryArticleImage(String title, String category) {
        String t = title != null ? title.toLowerCase() : "";
        String c = category != null ? category.toLowerCase() : "";
        if (t.contains("nutrition") || c.contains("nutrition")) {
            return "https://res.cloudinary.com/vphylrop/image/upload/v1788896774/Golden_retriever_eating_healthy_food_with_carrots.png";
        }
        if (t.contains("vaccin") || c.contains("vaccin")) {
            return "https://res.cloudinary.com/vphylrop/image/upload/v1788896780/Vet_examining_a_cat_with_stethoscope.png";
        }
        if (t.contains("groom") || c.contains("groom")) {
            return "https://res.cloudinary.com/vphylrop/image/upload/v1788896776/Golden_retriever_getting_a_bath_with_bubbles_and_rubber_duck.png";
        }
        if (t.contains("parasite") || t.contains("flea") || t.contains("sick") || c.contains("prevent")) {
            return "https://res.cloudinary.com/vphylrop/image/upload/v1788896775/Sick_dog_with_ice_pack_on_head.png";
        }
        if (t.contains("cat") || t.contains("play") || c.contains("behaviour")) {
            return "https://res.cloudinary.com/vphylrop/image/upload/v1788896779/Playful_cat_with_colorful_ball.png";
        }
        return "https://res.cloudinary.com/vphylrop/image/upload/v1788896774/Golden_retriever_eating_healthy_food_with_carrots.png";
    }
}
