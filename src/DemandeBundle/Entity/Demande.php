<?php

namespace DemandeBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Demande
 *
 * @ORM\Table(name="demande")
 * @ORM\Entity(repositoryClass="DemandeBundle\Repository\DemandeRepository")
 * 
 */
class Demande
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
     * @ORM\Column(name="titre", type="string", length=255)
     */
    private $titre;

    /**
     * @var string
     *
     * @ORM\Column(name="nom_prenom_recept", type="string", length=255)
     */
    private $nom_prenom_recept;

    /**
     * @var string
     *
     * @ORM\Column(name="addresse_recept", type="string", length=255)
     */
    private $addresse_recept;


    /**
     * @var string
     *
     * @ORM\Column(name="telephone_recept", type="string", length=255)
     */
    private $telephone_recept;

    /**
     * @var string
     *
     * @ORM\Column(name="montant", type="string", length=255)
     */
    private $montant;




    /**
     * @var string
     * @ORM\Column(name="note", type="string", length=255,nullable=true)
     */
    private $note;




    /**
     * @ORM\Column(name="etat", type="boolean",nullable=true)
     */
    private $etat;


    /**
     * @var date $date_emission
     *
     * @ORM\Column(name="date_emission", type="date", nullable=true)
     */
    private $date_emission;



    /**
     * @var date $date_recepetion
     *
     * @ORM\Column(name="date_reception", type="date", nullable=true)
     */
    private $date_recepetion;




    /**
     * @var integer
     *
     * @ORM\Column(name="quantite", type="integer",nullable=true)
     */
    private $quantite;


    /**
     * @var integer
     *
     * @ORM\Column(name="pointure", type="integer",nullable=true)
     */
    private $pointure;


    /**
     * @var string
     *
     * @ORM\Column(name="taille", type="string",length=255,nullable=true)
     */
    private $taille;


    /**
     * @var string
     *
     * @ORM\Column(name="tailleColis", type="string",length=255,nullable=true)
     */
    private $tailleColis;


    /**
     * @ORM\Column(name="fragile", type="boolean",nullable=true)
     */
    private $fragile;



    /**
     * @ORM\Column(name="readDemande", type="boolean",nullable=true)
     */
    private $readDemande;

    /**
     * @ORM\Column(name="modifiedDemande", type="boolean",nullable=true)
     */
    private $modifiedDemande;

    /**
     * @return mixed
     */
    public function getReadDemande()
    {
        return $this->readDemande;
    }

    /**
     * @param mixed $readDemande
     */
    public function setReadDemande($readDemande)
    {
        $this->readDemande = $readDemande;
    }

    /**
     * @return mixed
     */
    public function getModifiedDemande()
    {
        return $this->modifiedDemande;
    }

    /**
     * @param mixed $modifiedDemande
     */
    public function setModifiedDemande($modifiedDemande)
    {
        $this->modifiedDemande = $modifiedDemande;
    }







    /**
     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")
     * @ORM\JoinColumn(name="id_client",referencedColumnName="id",nullable=true)
     */
    private $id_client;



    /**
     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")
     * @ORM\JoinColumn(name="id_livreur",referencedColumnName="id",onDelete="SET NULL",nullable=true)
     */
    private $id_livreur;

    /**
     * @return mixed
     */
    public function getIdClient()
    {
        return $this->id_client;
    }

    /**
     * @param mixed $id_client
     */
    public function setIdClient($id_client)
    {
        $this->id_client = $id_client;
    }

    /**
     * @return mixed
     */
    public function getIdLivreur()
    {
        return $this->id_livreur;
    }

    /**
     * @param mixed $id_livreur
     */
    public function setIdLivreur($id_livreur)
    {
        $this->id_livreur = $id_livreur;
    }





    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getTitre()
    {
        return $this->titre;
    }

    /**
     * @param string $titre
     */
    public function setTitre($titre)
    {
        $this->titre = $titre;
    }

    /**
     * @return string
     */
    public function getNomPrenomRecept()
    {
        return $this->nom_prenom_recept;
    }

    /**
     * @param string $nom_prenom_recept
     */
    public function setNomPrenomRecept($nom_prenom_recept)
    {
        $this->nom_prenom_recept = $nom_prenom_recept;
    }

    /**
     * @return string
     */
    public function getAddresseRecept()
    {
        return $this->addresse_recept;
    }

    /**
     * @param string $addresse_recept
     */
    public function setAddresseRecept($addresse_recept)
    {
        $this->addresse_recept = $addresse_recept;
    }

    /**
     * @return string
     */
    public function getTelephoneRecept()
    {
        return $this->telephone_recept;
    }

    /**
     * @param string $telephone_recept
     */
    public function setTelephoneRecept($telephone_recept)
    {
        $this->telephone_recept = $telephone_recept;
    }

    /**
     * @return string
     */
    public function getMontant()
    {
        return $this->montant;
    }

    /**
     * @param string $montant
     */
    public function setMontant($montant)
    {
        $this->montant = $montant;
    }

    /**
     * @return string
     */
    public function getNote()
    {
        return $this->note;
    }

    /**
     * @param string $note
     */
    public function setNote($note)
    {
        $this->note = $note;
    }

    /**
     * @return mixed
     */
    public function getEtat()
    {
        return $this->etat;
    }

    /**
     * @param mixed $etat
     */
    public function setEtat($etat)
    {
        $this->etat = $etat;
    }

    /**
     * @return date
     */
    public function getDateEmission()
    {
        return $this->date_emission;
    }

    /**
     * @param date $date_emission
     */
    public function setDateEmission($date_emission)
    {
        $this->date_emission = $date_emission;
    }

    /**
     * @return date
     */
    public function getDateRecepetion()
    {
        return $this->date_recepetion;
    }

    /**
     * @param date $date_recepetion
     */
    public function setDateRecepetion($date_recepetion)
    {
        $this->date_recepetion = $date_recepetion;
    }

    /**
     * @return int
     */
    public function getQuantite()
    {
        return $this->quantite;
    }

    /**
     * @param int $quantite
     */
    public function setQuantite($quantite)
    {
        $this->quantite = $quantite;
    }

    /**
     * @return int
     */
    public function getPointure()
    {
        return $this->pointure;
    }

    /**
     * @param int $pointure
     */
    public function setPointure($pointure)
    {
        $this->pointure = $pointure;
    }

    /**
     * @return string
     */
    public function getTaille()
    {
        return $this->taille;
    }

    /**
     * @param string $taille
     */
    public function setTaille($taille)
    {
        $this->taille = $taille;
    }

    /**
     * @return mixed
     */
    public function getFragile()
    {
        return $this->fragile;
    }

    /**
     * @param mixed $fragile
     */
    public function setFragile($fragile)
    {
        $this->fragile = $fragile;
    }

    /**
     * @return mixed
     */
    public function getTailleColis()
    {
        return $this->tailleColis;
    }

    /**
     * @param mixed $tailleColis
     */
    public function setTailleColis($tailleColis)
    {
        $this->tailleColis = $tailleColis;
    }




    public function __construct()
    {
    }


}

