<?php

namespace UserBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DemandeBundle\Enum\DemandeEtatEnum;

use DemandeBundle\Enum\DemandeTypeDCEnum;

use DemandeBundle\Enum\DemandeTypeEnum;


use Symfony\Component\Validator\Constraints\DateTime;

use JMS\Serializer\Annotation as Serializer;


/**
 * UserToken
 *
 * @ORM\Table(name="user_token")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass="UserBundle\Repository\UserTokenRepository")

 */

class UserToken
{

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     */
    private $id;


    /**
     * @var string
     *
     * @ORM\Column(name="userId", type="string", length=255,nullable=true)
     */
    private $userId;

    /**
     * @var string
     *
     * @ORM\Column(name="token", type="string", length=255,nullable=true)
     */
    private $token;

    /**
     * @param string $userId
     */
    public function setUserId(string $userId)
    {
        $this->userId = $userId;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->userId;
    }

    /**
     * @return string
     */
    public function getToken(): string
    {
        return $this->token;
    }

    /**
     * @param string $token
     */
    public function setToken(string $token)
    {
        $this->token = $token;
    }






    public function __construct()

    {

    }




}