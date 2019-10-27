<?php

namespace ReclamationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use ReclamationBundle\Enum\ReclamationEtatEnum;

/**
 * Reclamation
 *
 * @ORM\Table(name="reclamation")
 * @ORM\Entity(repositoryClass="ReclamationBundle\Repository\ReclamationRepository")
 */
class Reclamation
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Sujet", type="string", length=255, nullable=true)
     */
    private $sujet;


    /**
     * @var string
     *
     * @ORM\Column(name="etat", type="string", length=255, nullable=true)
     */
    private $etat;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string", length=255, nullable=true, unique=true)
     */
    private $description;


    /**
     * @var date $date_creation
     *
     * @ORM\Column(name="date_creation", type="date", nullable=true)
     */
    private $date_creation;


    /**
     * @var date $date_modification
     *
     * @ORM\Column(name="date_modification", type="date", nullable=true)
     */
    private $date_modification;



    /**
     * @ORM\Column(name="readReclamation", type="boolean",nullable=true)
     */
    public $readReclamation;

    /**
     * @ORM\Column(name="modifiedReclamation", type="boolean",nullable=true)
     */
    private $modifiedReclamation;


    /**
     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")
     * @ORM\JoinColumn(name="id_user",referencedColumnName="id",onDelete="SET NULL",nullable=true)
     */
    private $id_user;

    /**
     * @return string
     */
    public function getEtat()
    {
        return $this->etat;
    }

    /**
     * @param string $etat
     * @return Reclamation
     */
    public function setEtat($etat)
    {
        if (!in_array($etat, ReclamationEtatEnum::getAvailableTypes())) {
            throw new \InvalidArgumentException("Invalid etat");
        }

        $this->etat = $etat;

        return $this;
    }


    /**
     * @return mixed
     */
    public function getIdUser()
    {
        return $this->id_user;
    }

    /**
     * @param mixed $id_user
     */
    public function setIdUser($id_user)
    {
        $this->id_user = $id_user;
    }


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set sujet
     *
     * @param string $sujet
     *
     * @return Reclamation
     */
    public function setSujet($sujet)
    {
        $this->sujet = $sujet;

        return $this;
    }

    /**
     * Get sujet
     *
     * @return string
     */
    public function getSujet()
    {
        return $this->sujet;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Reclamation
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getDateCreation()
    {
        return $this->date_creation;
    }

    /**
     * @param mixed $date_creation
     */
    public function setDateCreation($date_creation)
    {
        $this->date_creation = $date_creation;
    }

    /**
     * @return mixed
     */
    public function getDateModification()
    {
        return $this->date_modification;
    }

    /**
     * @param mixed $date_modification
     */
    public function setDateModification($date_modification)
    {
        $this->date_modification = $date_modification;
    }

    /**
     * @return mixed
     */
    public function getReadReclamation()
    {
        return $this->readReclamation;
    }

    /**
     * @param mixed $readReclamation
     */
    public function setReadReclamation($readReclamation)
    {
        $this->readReclamation = $readReclamation;
    }

    /**
     * @return mixed
     */
    public function getModifiedReclamation()
    {
        return $this->modifiedReclamation;
    }

    /**
     * @param mixed $modifiedReclamation
     */
    public function setModifiedReclamation($modifiedReclamation)
    {
        $this->modifiedReclamation = $modifiedReclamation;
    }



    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }
}

