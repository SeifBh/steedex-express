<?php

namespace DemandeBundle\Controller;

use DemandeBundle\Entity\Demande;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\FOSRestBundle;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Symfony\Bundle\FrameworkBundle\Controller\Controller as Con;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

class ApiController extends FOSRestController
{
    /**
     * @return Demande
     * @View(serializerGroups={"default", "demande"})
     */
    public function getDemandeAction(Request $req,$id){
        return $this->getDoctrine()->getRepository('DemandeBundle:Demande')->find($id);
    }




}
