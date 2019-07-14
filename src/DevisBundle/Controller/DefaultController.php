<?php

namespace DevisBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('DevisBundle:Default:index.html.twig');
    }

/*
    public function createAction(Request $request){

        $devis = new Devis();

        $form = $this->createForm(DevisType::class, $devis);
        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();

                $em->persist($devis);
                $em->flush();

                return $this->redirectToRoute("_list_devis");
            } else {
                $errors = $this->get('validator')->validate($devis);

                return $this->render('@Devis/Default/create.html.twig', array(
                    'errrs', $errors,
                    'form' => $form->createView()
                ));

            }


        }
        return $this->render('@Reclamation/Default/create.html.twig', array(
            'form' => $form->createView()
        ));


    }*/

}
