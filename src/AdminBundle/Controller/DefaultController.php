<?php

namespace AdminBundle\Controller;

use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('./default/test.html.twig', []);
    }


    public function afficherAction(){
        $em = $this->getDoctrine()->getManager();
        $users = $em->getRepository(User::class)->findAll();
        return $this->render('@Admin/Default/show.html.twig',array('users'=>$users) );
    }


}
