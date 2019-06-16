<?php
// src/AppBundle/Entity/User.php

namespace AppBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="fos_user")
 */
class User extends BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;


    /**
     * @var string
     *
     * @ORM\Column(name="nom", type="string", length=255)
     */
    private $nom ;


    /**
     * @var string
     *
     * @ORM\Column(name="prenom", type="string", length=255)
     */
    private $prenom ;


    /**
     * @var string
     *
     * @ORM\Column(name="addr", type="string", length=255)
     */
    private $addr ;


    /**
     * @var string
     *
     * @ORM\Column(name="addr", type="string", length=255)
     */
    private $tel ;





    public function __construct()
    {
        parent::__construct();
        // your own logic
    }
}