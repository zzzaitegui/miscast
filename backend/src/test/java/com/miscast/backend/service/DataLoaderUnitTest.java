package com.miscast.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;

import com.miscast.backend.entity.Person;

class DataLoaderUnitTest {

    private Person person(
            int actorCount, Double actorRating,
            int directorCount, Double directorRating,
            int writerCount, Double writerRating,
            int dopCount, Double dopRating,
            int composerCount, Double composerRating) {
        Person p = new Person();
        p.setActorCreditCount(actorCount);       p.setActorRating(actorRating);
        p.setDirectorCreditCount(directorCount); p.setDirectorRating(directorRating);
        p.setWriterCreditCount(writerCount);     p.setWriterRating(writerRating);
        p.setDopCreditCount(dopCount);           p.setDopRating(dopRating);
        p.setComposerCreditCount(composerCount); p.setComposerRating(composerRating);
        return p;
    }

    @Test
    void onlyActorRating_setsActorAsMainRole() {
        Person p = person(10, 7.5, 0, null, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("actor", p.getMainRole());
        assertEquals(7.5, p.getMainRoleRating());
    }

    @Test
    void onlyDirectorRating_setsDirectorAsMainRole() {
        Person p = person(0, null, 8, 8.2, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("director", p.getMainRole());
        assertEquals(8.2, p.getMainRoleRating());
    }

    @Test
    void higherCreditCountWins_directorBeatsActor() {
        Person p = person(5, 7.0, 12, 6.5, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("director", p.getMainRole());
    }

    @Test
    void higherCreditCountWins_actorBeatsDirector() {
        Person p = person(15, 7.0, 4, 8.5, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("actor", p.getMainRole());
    }

    @Test
    void equalCreditCount_actorWinsTiebreakerOverDirector() {
        Person p = person(6, 7.0, 6, 8.0, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("actor", p.getMainRole());
        assertEquals(7.0, p.getMainRoleRating());
    }

    @Test
    void equalCreditCount_directorWinsTiebreakerOverWriter() {
        Person p = person(0, null, 5, 7.8, 5, 6.5, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("director", p.getMainRole());
    }

    @Test
    void noValidRatings_setsNullMainRole() {
        Person p = person(20, null, 5, null, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertNull(p.getMainRole());
        assertNull(p.getMainRoleRating());
    }

    @Test
    void allRolesRated_highestCreditCountWins() {
        Person p = person(10, 7.0, 8, 8.0, 6, 6.5, 15, 7.5, 3, 6.0);
        DataLoader.applyMainRole(p);
        assertEquals("dop", p.getMainRole());
        assertEquals(7.5, p.getMainRoleRating());
    }

    @Test
    void roleWithNullRatingSkipped_evenIfHighestCount() {
        Person p = person(5, 7.2, 20, null, 0, null, 0, null, 0, null);
        DataLoader.applyMainRole(p);
        assertEquals("actor", p.getMainRole());
        assertEquals(7.2, p.getMainRoleRating());
    }
}
