<?php

namespace DemandeBundle\Controller;

use DemandeBundle\Entity\Demande;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\FOSRestBundle;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller as Con;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiController extends FOSRestController
{
    /**
     * @return Demande
     * @View(serializerGroups={"default", "demande"})
     */
    public function getDemandeAction(Request $req,$id){
        return $this->getDoctrine()->getRepository('DemandeBundle:Demande')->find($id);
    }



    /**
     * @Route("/getList", name="getList")
     * @Method({"Get"})
     * @View(serializerGroups={"default", "demande"})
     */
    public function getListAction()
    {
        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findAll();
        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }






}
