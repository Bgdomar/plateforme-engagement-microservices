package com.engagement.tm.entity;

public enum StatutTache {


    EN_ATTENTE,

    /**
     * Tâche ajoutée à une mission (missionId renseigné), disponible pour auto-assignation
     */
    A_FAIRE,

    /**
     * Un stagiaire s'est auto-assigné la tâche
     */
    ASSIGNEE,

    /**
     * Le stagiaire a démarré le travail
     */
    DEMARREE,

    /**
     * Le stagiaire a soumis un livrable
     */
    COMPLETEE,

    /**
     * L'encadrant a validé la tâche — état final
     */
    VALIDEE,

    /**
     * L'encadrant a rejeté le livrable, le stagiaire doit refaire
     */
    REFAIRE
}
