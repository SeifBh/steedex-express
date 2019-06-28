<?php

namespace ReponseBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Reponse
 *
 * @ORM\Table(name="reponse")
 * @ORM\Entity(repositoryClass="ReponseBundle\Repository\ReponseRepository")
 */
class Reponse
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
     * @ORM\ManyToOne(targetEntity="ReclamationBundle\Entity\Reclamation")
     * @ORM\JoinColumn(name="id_publication",referencedColumnName="id")
     */
    private $idReclamation;

    /**
     * @ORM\ManyToOne(targetEntity="UserBundle\Entity\User")
     * @ORM\JoinColumn(name="id_user",referencedColumnName="id")
     */
    private $idUser;


    /**
     * @var string
     *
     * @ORM\Column(name="contenue_reponse", type="string", length=255, nullable=true)
     */
    private $contenue_reponse;
    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_creation", type="date", nullable=true)
     */
    private $dateCreation;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_modif", type="date", nullable=true)
     */
    private $dateModif;

    /**
     * @return mixed
     */
    public function getIdReclamation()
    {
        return $this->idReclamation;
    }

    /**
     * @param mixed $idReclamation
     */
    public function setIdReclamation($idReclamation)
    {
        $this->idReclamation = $idReclamation;
    }

    /**
     * @return mixed
     */
    public function getIdUser()
    {
        return $this->idUser;
    }

    /**
     * @param mixed $idUser
     */
    public function setIdUser($idUser)
    {
        $this->idUser = $idUser;
    }

    /**
     * @return string
     */
    public function getContenueReponse()
    {
        return $this->contenue_reponse;
    }

    /**
     * @param string $contenue_reponse
     */
    public function setContenueReponse($contenue_reponse)
    {
        $this->contenue_reponse = $contenue_reponse;
    }

    /**
     * @return \DateTime
     */
    public function getDateCreation()
    {
        return $this->dateCreation;
    }

    /**
     * @param \DateTime $dateCreation
     */
    public function setDateCreation($dateCreation)
    {
        $this->dateCreation = $dateCreation;
    }

    /**
     * @return \DateTime
     */
    public function getDateModif()
    {
        return $this->dateModif;
    }

    /**
     * @param \DateTime $dateModif
     */
    public function setDateModif($dateModif)
    {
        $this->dateModif = $dateModif;
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
}

