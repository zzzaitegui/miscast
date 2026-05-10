package com.miscast.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "film_persons")
public class FilmPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(nullable = false)
    private String role;

    private String character;

    private int billingOrder;

    public FilmPerson() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Film getFilm() { return film; }
    public void setFilm(Film film) { this.film = film; }
    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }
    public int getBillingOrder() { return billingOrder; }
    public void setBillingOrder(int billingOrder) { this.billingOrder = billingOrder; }
}
