package com.farmingmarketsystem.service;

import com.farmingmarketsystem.model.Notification;
import com.farmingmarketsystem.model.Role;
import com.farmingmarketsystem.model.User;
import com.farmingmarketsystem.repository.NotificationRepository;
import com.farmingmarketsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    public Notification notifyUser(User user, String message){ return notificationRepository.save(Notification.builder().user(user).message(message).build()); }
    public List<Notification> list(Long userId){ return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId); }
    public void notifyAdmins(String message){ userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).forEach(a -> notifyUser(a, message)); }
}
