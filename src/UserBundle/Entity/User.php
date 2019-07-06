<?php

namespace UserBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * User
 *
 * @ORM\Table(name="fos_user")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="UserBundle\Repository\UserRepository")
 */
class User extends  BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     */
    public $id;



    /**
     * @var string
     *
     * @ORM\Column(name="idFiscale", type="string", length=255,nullable=true)
     */
    public $idFiscale ;

    /**
     * @return string
     */
    public function getIdFiscale()
    {
        return $this->idFiscale;
    }

    /**
     * @param string $idFiscale
     */
    public function setIdFiscale($idFiscale)
    {
        $this->idFiscale = $idFiscale;
    }



    /**
     * @var string
     *
     * @ORM\Column(name="nom", type="string", length=255)
     */
    public $nom ;


    /**
     * @var string
     *
     * @ORM\Column(name="prenom", type="string", length=255)
     */
    private $prenom ;



    /**
     * @var string
     *
     * @ORM\Column(name="addresse", type="string", length=255)
     */
    private $addresse ;



    /**
     * @var string
     *
     * @ORM\Column(name="tel", type="string", length=255)
     */
    public $tel ;

    /**
     * @return string
     */
    public function getAddresse()
    {
        return $this->addresse;
    }

    /**
     * @param string $addresse
     */
    public function setAddresse($addresse)
    {
        $this->addresse = $addresse;
    }

    /**
     * @return string
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * @param string $nom
     */
    public function setNom($nom)
    {
        $this->nom = $nom;
    }

    /**
     * @return string
     */
    public function getPrenom()
    {
        return $this->prenom;
    }

    /**
     * @param string $prenom
     */
    public function setPrenom($prenom)
    {
        $this->prenom = $prenom;
    }

    /**
     * @return string
     */
    public function getTel()
    {
        return $this->tel;
    }

    /**
     * @param string $tel
     */
    public function setTel($tel)
    {
        $this->tel = $tel;
    }






    public function __construct()
    {
        parent::__construct();
        // your own logic
    }

}

